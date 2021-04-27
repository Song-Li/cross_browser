#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
This module converts an AWS API Gateway proxied request to a WSGI request.

Inspired by: https://github.com/miserlou/zappa

Author: Logan Raarup <logan@logan.dk>
"""
import base64
import os
import sys
from werkzeug.datastructures import Headers, iter_multi_items, MultiDict
from werkzeug.wrappers import Response
from werkzeug.urls import url_encode, url_unquote, url_unquote_plus
from werkzeug.http import HTTP_STATUS_CODES
from werkzeug._compat import BytesIO, string_types, to_bytes, wsgi_encoding_dance

# List of MIME types that should not be base64 encoded. MIME types within `text/*`
# are included by default.
TEXT_MIME_TYPES = [
    "application/json",
    "application/javascript",
    "application/xml",
    "application/vnd.api+json",
    "image/svg+xml",
]


def all_casings(input_string):
    """
    Permute all casings of a given string.
    A pretty algoritm, via @Amber
    http://stackoverflow.com/questions/6792803/finding-all-possible-case-permutations-in-python
    """
    if not input_string:
        yield ""
    else:
        first = input_string[:1]
        if first.lower() == first.upper():
            for sub_casing in all_casings(input_string[1:]):
                yield first + sub_casing
        else:
            for sub_casing in all_casings(input_string[1:]):
                yield first.lower() + sub_casing
                yield first.upper() + sub_casing


def split_headers(headers):
    """
    If there are multiple occurrences of headers, create case-mutated variations
    in order to pass them through APIGW. This is a hack that's currently
    needed. See: https://github.com/logandk/serverless-wsgi/issues/11
    Source: https://github.com/Miserlou/Zappa/blob/master/zappa/middleware.py
    """
    new_headers = {}

    for key in headers.keys():
        values = headers.get_all(key)
        if len(values) > 1:
            for value, casing in zip(values, all_casings(key)):
                new_headers[casing] = value
        elif len(values) == 1:
            new_headers[key] = values[0]

    return new_headers


def group_headers(headers):
    new_headers = {}

    for key in headers.keys():
        new_headers[key] = headers.get_all(key)

    return new_headers


def is_alb_event(event):
    return event.get("requestContext", {}).get("elb")


def encode_query_string(event):
    params = event.get(u"multiValueQueryStringParameters")
    if not params:
        params = event.get(u"queryStringParameters")
    if not params:
        params = ""
    if is_alb_event(event):
        params = MultiDict(
            (url_unquote_plus(k), url_unquote_plus(v))
            for k, v in iter_multi_items(params)
        )
    return url_encode(params)


def get_script_name(headers, request_context):
    strip_stage_path = os.environ.get("STRIP_STAGE_PATH", "").lower().strip() in [
        "yes",
        "y",
        "true",
        "t",
        "1",
    ]

    if u"amazonaws.com" in headers.get(u"Host", u"") and not strip_stage_path:
        script_name = "/{}".format(request_context.get(u"stage", ""))
    else:
        script_name = ""
    return script_name


def get_body_bytes(event, body):
    if event.get("isBase64Encoded", False):
        body = base64.b64decode(body)
    if isinstance(body, string_types):
        body = to_bytes(body, charset="utf-8")
    return body


def setup_environ_items(environ, headers):
    for key, value in environ.items():
        if isinstance(value, string_types):
            environ[key] = wsgi_encoding_dance(value)

    for key, value in headers.items():
        key = "HTTP_" + key.upper().replace("-", "_")
        if key not in ("HTTP_CONTENT_TYPE", "HTTP_CONTENT_LENGTH"):
            environ[key] = value
    return environ


def generate_response(response, event):
    returndict = {u"statusCode": response.status_code}

    if u"multiValueHeaders" in event:
        returndict[u"multiValueHeaders"] = group_headers(response.headers)
    else:
        returndict[u"headers"] = split_headers(response.headers)

    if is_alb_event(event):
        # If the request comes from ALB we need to add a status description
        returndict["statusDescription"] = u"%d %s" % (
            response.status_code,
            HTTP_STATUS_CODES[response.status_code],
        )

    if response.data:
        mimetype = response.mimetype or "text/plain"
        if (
            mimetype.startswith("text/") or mimetype in TEXT_MIME_TYPES
        ) and not response.headers.get("Content-Encoding", ""):
            returndict["body"] = response.get_data(as_text=True)
            returndict["isBase64Encoded"] = False
        else:
            returndict["body"] = base64.b64encode(response.data).decode("utf-8")
            returndict["isBase64Encoded"] = True

    return returndict


def handle_request(app, event, context):
    if event.get("source") in ["aws.events", "serverless-plugin-warmup"]:
        print("Lambda warming event received, skipping handler")
        return {}

    if event.get("version") == "2.0":
        return handle_payload_v2(app, event, context)

    return handle_payload_v1(app, event, context)


def handle_payload_v1(app, event, context):
    if u"multiValueHeaders" in event:
        headers = Headers(event[u"multiValueHeaders"])
    else:
        headers = Headers(event[u"headers"])

    script_name = get_script_name(headers, event.get("requestContext", {}))

    # If a user is using a custom domain on API Gateway, they may have a base
    # path in their URL. This allows us to strip it out via an optional
    # environment variable.
    path_info = event[u"path"]
    base_path = os.environ.get("API_GATEWAY_BASE_PATH")
    if base_path:
        script_name = "/" + base_path

        if path_info.startswith(script_name):
            path_info = path_info[len(script_name) :]

    body = event[u"body"] or ""
    body = get_body_bytes(event, body)

    environ = {
        "CONTENT_LENGTH": str(len(body)),
        "CONTENT_TYPE": headers.get(u"Content-Type", ""),
        "PATH_INFO": url_unquote(path_info),
        "QUERY_STRING": encode_query_string(event),
        "REMOTE_ADDR": event.get(u"requestContext", {})
        .get(u"identity", {})
        .get(u"sourceIp", ""),
        "REMOTE_USER": event.get(u"requestContext", {})
        .get(u"authorizer", {})
        .get(u"principalId", ""),
        "REQUEST_METHOD": event.get(u"httpMethod", {}),
        "SCRIPT_NAME": script_name,
        "SERVER_NAME": headers.get(u"Host", "lambda"),
        "SERVER_PORT": headers.get(u"X-Forwarded-Port", "80"),
        "SERVER_PROTOCOL": "HTTP/1.1",
        "wsgi.errors": sys.stderr,
        "wsgi.input": BytesIO(body),
        "wsgi.multiprocess": False,
        "wsgi.multithread": False,
        "wsgi.run_once": False,
        "wsgi.url_scheme": headers.get(u"X-Forwarded-Proto", "http"),
        "wsgi.version": (1, 0),
        "serverless.authorizer": event.get(u"requestContext", {}).get(u"authorizer"),
        "serverless.event": event,
        "serverless.context": context,
        # TODO: Deprecate the following entries, as they do not comply with the WSGI
        # spec. For custom variables, the spec says:
        #
        #   Finally, the environ dictionary may also contain server-defined variables.
        #   These variables should be named using only lower-case letters, numbers, dots,
        #   and underscores, and should be prefixed with a name that is unique to the
        #   defining server or gateway.
        "API_GATEWAY_AUTHORIZER": event.get(u"requestContext", {}).get(u"authorizer"),
        "event": event,
        "context": context,
    }

    environ = setup_environ_items(environ, headers)

    response = Response.from_app(app, environ)
    returndict = generate_response(response, event)

    return returndict


def handle_payload_v2(app, event, context):
    headers = Headers(event[u"headers"])

    script_name = get_script_name(headers, event.get("requestContext", {}))

    path_info = event[u"rawPath"]

    body = event.get("body", "")
    body = get_body_bytes(event, body)

    headers["Cookie"] = "; ".join(event.get("cookies", []))

    environ = {
        "CONTENT_LENGTH": str(len(body)),
        "CONTENT_TYPE": headers.get(u"Content-Type", ""),
        "PATH_INFO": url_unquote(path_info),
        "QUERY_STRING": url_encode(event.get(u"queryStringParameters", {})),
        "REMOTE_ADDR": event.get("requestContext", {})
        .get(u"http", {})
        .get(u"sourceIp", ""),
        "REMOTE_USER": event.get("requestContext", {})
        .get(u"authorizer", {})
        .get(u"principalId", ""),
        "REQUEST_METHOD": event.get("requestContext", {})
        .get("http", {})
        .get("method", ""),
        "SCRIPT_NAME": script_name,
        "SERVER_NAME": headers.get(u"Host", "lambda"),
        "SERVER_PORT": headers.get(u"X-Forwarded-Port", "80"),
        "SERVER_PROTOCOL": "HTTP/1.1",
        "wsgi.errors": sys.stderr,
        "wsgi.input": BytesIO(body),
        "wsgi.multiprocess": False,
        "wsgi.multithread": False,
        "wsgi.run_once": False,
        "wsgi.url_scheme": headers.get(u"X-Forwarded-Proto", "http"),
        "wsgi.version": (1, 0),
        "serverless.authorizer": event.get("requestContext", {}).get(u"authorizer"),
        "serverless.event": event,
        "serverless.context": context,
        # TODO: Deprecate the following entries, as they do not comply with the WSGI
        # spec. For custom variables, the spec says:
        #
        #   Finally, the environ dictionary may also contain server-defined variables.
        #   These variables should be named using only lower-case letters, numbers, dots,
        #   and underscores, and should be prefixed with a name that is unique to the
        #   defining server or gateway.
        "API_GATEWAY_AUTHORIZER": event.get("requestContext", {}).get(u"authorizer"),
        "event": event,
        "context": context,
    }

    environ = setup_environ_items(environ, headers)

    response = Response.from_app(app, environ)

    returndict = generate_response(response, event)

    return returndict
