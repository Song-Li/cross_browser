<p align="center">
  <img src="https://logandk.github.io/serverless-wsgi/assets/header.svg">
</p>

[![npm package](https://nodei.co/npm/serverless-wsgi.svg?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/serverless-wsgi/)

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Build Status](https://travis-ci.org/logandk/serverless-wsgi.svg?branch=master)](https://travis-ci.org/logandk/serverless-wsgi)
[![Coverage Status](https://codecov.io/gh/logandk/serverless-wsgi/branch/master/graph/badge.svg)](https://codecov.io/gh/logandk/serverless-wsgi)
[![Dependency Status](https://david-dm.org/logandk/serverless-wsgi.svg)](https://david-dm.org/logandk/serverless-wsgi)
[![Dev Dependency Status](https://david-dm.org/logandk/serverless-wsgi/dev-status.svg)](https://david-dm.org/logandk/serverless-wsgi?type=dev)

A Serverless v1.x plugin to build your deploy Python WSGI applications using Serverless. Compatible
WSGI application frameworks include Flask, Django and Pyramid - for a complete list, see:
http://wsgi.readthedocs.io/en/latest/frameworks.html.

### Features

- Transparently converts API Gateway and ALB requests to and from standard WSGI requests
- Supports anything you'd expect from WSGI such as redirects, cookies, file uploads etc.
- Automatically downloads Python packages that you specify in `requirements.txt` and deploys them along with your application
- Convenient `wsgi serve` command for serving your application locally during development
- Includes CLI commands for remote execution of Python code (`wsgi exec`), shell commands (`wsgi command`), Flask CLI commands (`wsgi flask`) and Django management commands (`wsgi manage`)
- Supports both APIGatewayV1 and APIGatewayV2 payloads

## Install

```
sls plugin install -n serverless-wsgi
```

This will automatically add the plugin to `package.json` and the plugins section of `serverless.yml`.

## Flask configuration example

<p align="center">
  <img src="https://logandk.github.io/serverless-wsgi/assets/hello-world.svg">
</p>

This example assumes that you have intialized your application as `app` inside `api.py`.

```
project
├── api.py
├── requirements.txt
└── serverless.yml
```

### api.py

A regular Flask application.

```python
from flask import Flask
app = Flask(__name__)


@app.route("/cats")
def cats():
    return "Cats"


@app.route("/dogs/<id>")
def dog(id):
    return "Dog"
```

### serverless.yml

Load the plugin and set the `custom.wsgi.app` configuration in `serverless.yml` to the
module path of your Flask application.

All functions that will use WSGI need to have `wsgi_handler.handler` set as the Lambda handler and
use the default `lambda-proxy` integration for API Gateway. This configuration example treats
API Gateway as a transparent proxy, passing all requests directly to your Flask application,
and letting the application handle errors, 404s etc.

_Note: The WSGI handler was called `wsgi.handler` earlier, but was renamed to `wsgi_handler.handler`
in `1.7.0`. The old name is still supported but using it will cause a deprecation warning._

```yaml
service: example

provider:
  name: aws
  runtime: python3.6

plugins:
  - serverless-wsgi

functions:
  api:
    handler: wsgi_handler.handler
    events:
      - http: ANY /
      - http: ANY {proxy+}

custom:
  wsgi:
    app: api.app
```

### requirements.txt

Add Flask to the application bundle.

```
Flask==1.0.2
```

## Deployment

Simply run the serverless deploy command as usual:

```
$ sls deploy
Serverless: Using Python specified in "runtime": python3.6
Serverless: Packaging Python WSGI handler...
Serverless: Packaging required Python packages...
Serverless: Linking required Python packages...
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Unlinking required Python packages...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (864.57 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............
Serverless: Stack update finished...
```

## Other frameworks

Set `custom.wsgi.app` in `serverless.yml` according to your WSGI callable:

- For Pyramid, use [make_wsgi_app](http://docs.pylonsproject.org/projects/pyramid/en/latest/api/config.html#pyramid.config.Configurator.make_wsgi_app) to intialize the callable
- Django is configured for WSGI by default, set the callable to `<project_name>.wsgi.application`. See https://docs.djangoproject.com/en/1.10/howto/deployment/wsgi/ for more information.

## Usage

### Automatic requirement packaging

You'll need to include any packages that your application uses in the bundle
that's deployed to AWS Lambda. This plugin helps you out by doing this automatically,
as long as you specify your required packages in a `requirements.txt` file in the root
of your Serverless service path:

```
Flask==1.0.2
requests==2.21.0
```

For more information, see https://pip.pypa.io/en/latest/user_guide/#requirements-files.

The `serverless-wsgi` plugin itself depends on `werkzeug` and will package it automatically,
even if `werkzeug` is not present in your `requirements.txt`.

You can use the requirement packaging functionality of _serverless-wsgi_ without the WSGI
handler itself by including the plugin in your `serverless.yml` configuration, without specifying
the `custom.wsgi.app` setting. This will omit the WSGI handler from the package, but include
any requirements specified in `requirements.txt`.

If you don't want to use automatic requirement packaging you can set `custom.wsgi.packRequirements` to false:

```yaml
custom:
  wsgi:
    app: api.app
    packRequirements: false
```

In order to pass additional arguments to `pip` when installing requirements, the `pipArgs` configuration
option is available:

```yaml
custom:
  wsgi:
    app: api.app
    pipArgs: --no-deps
```

For a more advanced approach to packaging requirements, consider using https://github.com/UnitedIncome/serverless-python-requirements.
When the `serverless-python-requirements` is added to `serverless.yml`, the `packRequirements` option
is set to `false` by default.

If you have `packRequirements` set to `false`, or if you use `serverless-python-requirements`, remember to add
`werkzeug` explicitly in your `requirements.txt`.

### Python version

Python is used for packaging requirements and serving the app when invoking `sls wsgi serve`. By
default, the current runtime setting is expected to be the name of the Python binary in `PATH`,
for instance `python3.6`. If this is not the name of your Python binary, override it using the
`pythonBin` option:

```yaml
custom:
  wsgi:
    app: api.app
    pythonBin: python3
```

### Local server

<p align="center">
  <img src="https://logandk.github.io/serverless-wsgi/assets/serve.svg">
</p>

For convenience, a `sls wsgi serve` command is provided to run your WSGI application
locally. This command requires the `werkzeug` Python package to be installed,
and acts as a simple wrapper for starting werkzeug's built-in HTTP server.

By default, the server will start on port 5000.

```
$ sls wsgi serve
 * Running on http://localhost:5000/ (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
```

Configure the port using the `-p` parameter:

```
$ sls wsgi serve -p 8000
 * Running on http://localhost:8000/ (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
```

When running locally, an environment variable named `IS_OFFLINE` will be set to `True`.
So, if you want to know when the application is running locally, check `os.environ["IS_OFFLINE"]`.

### Remote command execution

<p align="center">
  <img src="https://logandk.github.io/serverless-wsgi/assets/command.svg">
</p>

The `wsgi exec` command lets you execute Python code remotely:

```
$ sls wsgi exec -c "import math; print((1 + math.sqrt(5)) / 2)"
1.618033988749895

$ cat count.py
for i in range(3):
    print(i)

$ sls wsgi exec -f count.py
0
1
2
```

The `wsgi command` command lets you execute shell commands remotely:

```
$ sls wsgi command -c "pwd"
/var/task

$ cat script.sh
#!/bin/bash
echo "dlrow olleh" | rev

$ sls wsgi command -f script.sh
hello world
```

The `wsgi flask` command lets you execute [Flask CLI custom commands](http://flask.pocoo.org/docs/latest/cli/#custom-commands) remotely:

```
$ sls wsgi flask -c "my command"
Hello world!
```

The `wsgi manage` command lets you execute Django management commands remotely:

```
$ sls wsgi manage -c "check --list-tags"
admin
caches
database
models
staticfiles
templates
urls
```

All commands have `local` equivalents that let you run commands through `sls invoke local` rather
than `sls invoke`, i.e. on the local machine instead of through Lambda. The `local` commands (`sls wsgi command local`,
`sls wsgi exec local`, `sls wsgi flask local` and `sls wsgi manage local`) take the same arguments
as their remote counterparts documented above.

### Explicit routes

If you'd like to be explicit about which routes and HTTP methods should pass through to your
application, see the following example:

```yaml
service: example

provider:
  name: aws
  runtime: python3.6

plugins:
  - serverless-wsgi

functions:
  api:
    handler: wsgi_handler.handler
    events:
      - http:
          path: cats
          method: get
          integration: lambda-proxy
      - http:
          path: dogs/{id}
          method: get
          integration: lambda-proxy

custom:
  wsgi:
    app: api.app
```

### Custom domain names

If you use custom domain names with API Gateway, you might have a base path that is
at the beginning of your path, such as the stage (`/dev`, `/stage`, `/prod`). In this case, set
the `API_GATEWAY_BASE_PATH` environment variable to let `serverless-wsgi` know.
E.g, if you deploy your WSGI application to https://mydomain.com/api/myservice,
set `API_GATEWAY_BASE_PATH` to `api/myservice` (no `/` first).

The example below uses the [serverless-domain-manager](https://github.com/amplify-education/serverless-domain-manager)
plugin to handle custom domains in API Gateway:

```yaml
service: example

provider:
  name: aws
  runtime: python3.6
  environment:
    API_GATEWAY_BASE_PATH: ${self:custom.customDomain.basePath}

plugins:
  - serverless-wsgi
  - serverless-domain-manager

functions:
  api:
    handler: wsgi_handler.handler
    events:
      - http: ANY /
      - http: ANY {proxy+}

custom:
  wsgi:
    app: api.app
  customDomain:
    basePath: ${opt:stage}
    domainName: mydomain.name.com
    stage: ${opt:stage}
    createRoute53Record: true
```

**Note**: The **API_GATEWAY_BASE_PATH** configuration is only needed when using the payload V1. In the V2, the path does not have the **basePath** in the beginning.
### Using CloudFront

If you're configuring CloudFront manually in front of your API and setting
the Path in the CloudFront Origin to include your stage name, you'll need
to strip it out from the path supplied to WSGI. This is so that your app
doesn't generate URLs starting with `/production`.

Pass the `STRIP_STAGE_PATH=yes` environment variable to your application
to set this:

```yaml
service: example

provider:
  name: aws
  runtime: python3.6
  environment:
    STRIP_STAGE_PATH: yes
```

### File uploads

In order to accept file uploads from HTML forms, make sure to add `multipart/form-data` to
the list of content types with _Binary Support_ in your API Gateway API. The
[serverless-apigw-binary](https://github.com/maciejtreder/serverless-apigw-binary)
Serverless plugin can be used to automate this process.

Keep in mind that, when building Serverless applications, uploading
[directly to S3](http://docs.aws.amazon.com/AmazonS3/latest/dev/UsingHTTPPOST.html)
from the browser is usually the preferred approach.

### Raw context and event

The raw context and event from AWS Lambda are both accessible through the WSGI
request. The following example shows how to access them when using Flask:

```python
from flask import Flask, request
app = Flask(__name__)


@app.route("/")
def index():
    print(request.environ['serverless.context'])
    print(request.environ['serverless.event'])
```

For more information on these objects, read the documentation on [events](https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html)
and the [invocation context](https://docs.aws.amazon.com/lambda/latest/dg/python-context.html).

### Text MIME types

By default, all MIME types starting with `text/` and the following whitelist are sent
through API Gateway in plain text. All other MIME types will have their response body
base64 encoded (and the `isBase64Encoded` API Gateway flag set) in order to be
delivered by API Gateway as binary data (remember to add any binary MIME types that
you're using to the _Binary Support_ list in API Gateway).

This is the default whitelist of plain text MIME types:

- `application/json`
- `application/javascript`
- `application/xml`
- `application/vnd.api+json`
- `image/svg+xml`

In order to add additional plain text MIME types to this whitelist, use the
`textMimeTypes` configuration option:

```yaml
custom:
  wsgi:
    app: api.app
    textMimeTypes:
      - application/custom+json
      - application/vnd.company+json
```

### Preventing cold starts

Common ways to keep lambda functions warm include [scheduled events](https://serverless.com/framework/docs/providers/aws/events/schedule/)
and the [WarmUP plugin](https://github.com/FidelLimited/serverless-plugin-warmup). Both these event sources
are supported by default and will be ignored by `serverless-wsgi`.

### Alternative directory structure

If you have several functions in `serverless.yml` and want to organize them in
directories, e.g.:

```
project
├── web
│   ├── api.py
│   └── requirements.txt
├── serverless.yml
└── another_function.py
```

In this case, tell `serverless-wsgi` where to find the handler by prepending the
directory:

```yaml
service: example

provider:
  name: aws
  runtime: python3.6

plugins:
  - serverless-wsgi

functions:
  api:
    handler: wsgi_handler.handler
    events:
      - http: ANY /
      - http: ANY {proxy+}

  another_function:
    handler: another_function.handler

custom:
  wsgi:
    app: web/api.app
```

Requirements will now be installed into `web/`, rather than at in the service root directory.

The same rule applies when using the `individually: true` flag in the `package` settings, together
with the `module` option provided by `serverless-python-requirements`. In that case, both the requirements
and the WSGI handler will be installed into `web/`, if the function is configured with `module: "web"`.

## Usage without Serverless

The AWS API Gateway to WSGI mapping module is available on PyPI in the
`serverless-wsgi` package.

Use this package if you need to deploy Python Lambda functions to handle
API Gateway events directly, without using the Serverless framework.

```
pip install serverless-wsgi
```

Initialize your WSGI application and in your Lambda event handler, call
the request mapper:

```python
import app  # Replace with your actual application
import serverless_wsgi

# If you need to send additional content types as text, add then directly
# to the whitelist:
#
# serverless_wsgi.TEXT_MIME_TYPES.append("application/custom+json")

def handler(event, context):
    return serverless_wsgi.handle_request(app.app, event, context)
```

# Thanks

Thanks to [Zappa](https://github.com/Miserlou/Zappa), which has been both the
inspiration and source of several implementations that went into this project.

Thanks to [chalice](https://github.com/awslabs/chalice) for the
requirement packaging implementation.
