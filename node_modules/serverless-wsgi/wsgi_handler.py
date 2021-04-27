#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
This module loads the WSGI application specified by FQN in `.serverless-wsgi` and invokes
the request when the handler is called by AWS Lambda.

Author: Logan Raarup <logan@logan.dk>
"""
import importlib
import json
import os
import sys
import traceback

# Call decompression helper from `serverless-python-requirements` if
# available. See: https://github.com/UnitedIncome/serverless-python-requirements#dealing-with-lambdas-size-limitations
try:
    import unzip_requirements  # noqa
except ImportError:
    pass

import serverless_wsgi


def load_config():
    """ Read the configuration file created during deployment
    """
    root = os.path.abspath(os.path.dirname(__file__))
    with open(os.path.join(root, ".serverless-wsgi"), "r") as f:
        return json.loads(f.read())


def import_app(config):
    """ Load the application WSGI handler
    """
    wsgi_fqn = config["app"].rsplit(".", 1)
    wsgi_fqn_parts = wsgi_fqn[0].rsplit("/", 1)

    if len(wsgi_fqn_parts) == 2:
        root = os.path.abspath(os.path.dirname(__file__))
        sys.path.insert(0, os.path.join(root, wsgi_fqn_parts[0]))

    try:
        wsgi_module = importlib.import_module(wsgi_fqn_parts[-1])

        return getattr(wsgi_module, wsgi_fqn[1])
    except:  # noqa
        traceback.print_exc()
        raise Exception("Unable to import {}".format(config["app"]))


def append_text_mime_types(config):
    """ Append additional text (non-base64) mime types from configuration file
    """
    if "text_mime_types" in config and isinstance(config["text_mime_types"], list):
        serverless_wsgi.TEXT_MIME_TYPES.extend(config["text_mime_types"])


def handler(event, context):
    """ Lambda event handler, invokes the WSGI wrapper and handles command invocation
    """
    if "_serverless-wsgi" in event:
        import shlex
        import subprocess
        from werkzeug._compat import StringIO, to_native

        native_stdout = sys.stdout
        native_stderr = sys.stderr
        output_buffer = StringIO()

        try:
            sys.stdout = output_buffer
            sys.stderr = output_buffer

            meta = event["_serverless-wsgi"]
            if meta.get("command") == "exec":
                # Evaluate Python code
                exec(meta.get("data", ""))
            elif meta.get("command") == "command":
                # Run shell commands
                result = subprocess.check_output(
                    meta.get("data", ""), shell=True, stderr=subprocess.STDOUT
                )
                output_buffer.write(to_native(result))
            elif meta.get("command") == "manage":
                # Run Django management commands
                from django.core import management

                management.call_command(*shlex.split(meta.get("data", "")))
            elif meta.get("command") == "flask":
                # Run Flask CLI commands
                from flask.cli import FlaskGroup

                flask_group = FlaskGroup(create_app=_create_app)
                flask_group.main(
                    shlex.split(meta.get("data", "")), standalone_mode=False
                )
            else:
                raise Exception("Unknown command: {}".format(meta.get("command")))
        except subprocess.CalledProcessError as e:
            return [e.returncode, e.output.decode("utf-8")]
        except:  # noqa
            return [1, traceback.format_exc()]
        finally:
            sys.stdout = native_stdout
            sys.stderr = native_stderr

        return [0, output_buffer.getvalue()]
    else:
        return serverless_wsgi.handle_request(wsgi_app, event, context)


def _create_app():
    return wsgi_app


# Read configuration and import the WSGI application
config = load_config()
wsgi_app = import_app(config)
append_text_mime_types(config)
