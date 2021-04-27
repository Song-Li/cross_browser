#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
This module serves a WSGI application using werkzeug.

Author: Logan Raarup <logan@logan.dk>
"""
import argparse
import importlib
import os
import sys

try:
    from werkzeug import serving
except ImportError:  # pragma: no cover
    sys.exit("Unable to import werkzeug (run: pip install werkzeug)")


def parse_args():  # pragma: no cover
    parser = argparse.ArgumentParser(description="serverless-wsgi server")

    # Positional arguments for backwards compatibility
    parser.add_argument("cwd", help="Set current working directory for server")
    parser.add_argument("app", help="Full import path to WSGI app")
    parser.add_argument(
        "port", type=int, default=5000, help="Port for server to listen on"
    )
    parser.add_argument(
        "host", default="localhost", help="Host/ip to bind the server to"
    )

    # Concurrency options.
    # For backwards compatibility, threading is enabled by default and only one process is used.
    parser.add_argument("--disable-threading", action="store_false", dest="use_threads")
    parser.add_argument("--num-processes", type=int, dest="processes", default=1)

    # Optional serving using HTTPS
    parser.add_argument("--ssl", action="store_true", dest="ssl")

    return parser.parse_args()


def serve(cwd, app, port=5000, host="localhost", threaded=True, processes=1, ssl=False):
    sys.path.insert(0, cwd)

    os.environ["IS_OFFLINE"] = "True"

    wsgi_fqn = app.rsplit(".", 1)
    wsgi_fqn_parts = wsgi_fqn[0].rsplit("/", 1)
    if len(wsgi_fqn_parts) == 2:
        sys.path.insert(0, os.path.join(cwd, wsgi_fqn_parts[0]))
    wsgi_module = importlib.import_module(wsgi_fqn_parts[-1])
    wsgi_app = getattr(wsgi_module, wsgi_fqn[1])

    if ssl:
        ssl_context = "adhoc"
    else:
        ssl_context = None

    # Attempt to force Flask into debug mode
    try:
        wsgi_app.debug = True
    except:  # noqa: E722
        pass

    serving.run_simple(
        host,
        int(port),
        wsgi_app,
        use_debugger=True,
        use_reloader=True,
        use_evalex=True,
        threaded=threaded,
        processes=processes,
        ssl_context=ssl_context,
    )


if __name__ == "__main__":  # pragma: no cover
    args = parse_args()

    serve(
        cwd=args.cwd,
        app=args.app,
        port=args.port,
        host=args.host,
        threaded=args.use_threads,
        processes=args.processes,
        ssl=args.ssl,
    )
