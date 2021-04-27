# Serverless Python Requirements

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
![Github Actions](https://github.com/UnitedIncome/serverless-python-requirements/workflows/Test/badge.svg)
[![npm](https://img.shields.io/npm/v/serverless-python-requirements.svg)](https://www.npmjs.com/package/serverless-python-requirements)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

A Serverless v1.x plugin to automatically bundle dependencies from
`requirements.txt` and make them available in your `PYTHONPATH`.

## Requires Serverless >= v1.34

## Install

```shell
sls plugin install -n serverless-python-requirements
```

This will automatically add the plugin to your project's `package.json` and the plugins section of its
`serverless.yml`. That's all that's needed for basic use! The plugin will now bundle your python
dependencies specified in your `requirements.txt` or `Pipfile` when you run `sls deploy`.

For a more in depth introduction on how to use this plugin, check out
[this post on the Serverless Blog](https://serverless.com/blog/serverless-python-packaging/)

If you're on a mac, check out [these notes](#applebeersnake-mac-brew-installed-python-notes) about using python installed by brew.

## Cross compiling

Compiling non-pure-Python modules or fetching their manylinux wheels is
supported on non-linux OSs via the use of Docker and the
[docker-lambda](https://github.com/lambci/docker-lambda) image.
To enable docker usage, add the following to your `serverless.yml`:

```yaml
custom:
  pythonRequirements:
    dockerizePip: true
```

The dockerizePip option supports a special case in addition to booleans of `'non-linux'` which makes
it dockerize only on non-linux environments.

To utilize your own Docker container instead of the default, add the following to your `serverless.yml`:

```yaml
custom:
  pythonRequirements:
    dockerImage: <image name>:tag
```

This must be the full image name and tag to use, including the runtime specific tag if applicable.

Alternatively, you can define your Docker image in your own Dockerfile and add the following to your `serverless.yml`:

```yaml
custom:
  pythonRequirements:
    dockerFile: ./path/to/Dockerfile
```

With `Dockerfile` the path to the Dockerfile that must be in the current folder (or a subfolder).
Please note the `dockerImage` and the `dockerFile` are mutually exclusive.

To install requirements from private git repositories, add the following to your `serverless.yml`:

```yaml
custom:
  pythonRequirements:
    dockerizePip: true
    dockerSsh: true
```

The `dockerSsh` option will mount your `$HOME/.ssh/id_rsa` and `$HOME/.ssh/known_hosts` as a
volume in the docker container. If your SSH key is password protected, you can use `ssh-agent`
because `$SSH_AUTH_SOCK` is also mounted & the env var set.
It is important that the host of your private repositories has already been added in your
`$HOME/.ssh/known_hosts` file, as the install process will fail otherwise due to host authenticity
failure.

You can also pass environment variables to docker by specifying them in `dockerEnv`
option:

```yaml
custom:
  pythonRequirements:
    dockerEnv:
      - https_proxy
```

[:checkered_flag: Windows notes](#checkered_flag-windows-dockerizepip-notes)

## :sparkles::cake::sparkles: Pipenv support

If you include a `Pipfile` and have `pipenv` installed instead of a `requirements.txt` this will use
`pipenv lock -r` to generate them. It is fully compatible with all options such as `zip` and
`dockerizePip`. If you don't want this plugin to generate it for you, set the following option:

```yaml
custom:
  pythonRequirements:
    usePipenv: false
```

## :sparkles::pencil::sparkles: Poetry support

If you include a `pyproject.toml` and have `poetry` installed instead of a `requirements.txt` this will use
`poetry export --without-hashes -f requirements.txt -o requirements.txt --with-credentials` to generate them. It is fully compatible with all options such as `zip` and
`dockerizePip`. If you don't want this plugin to generate it for you, set the following option:

```yaml
custom:
  pythonRequirements:
    usePoetry: false
```

### Poetry with git dependencies

Poetry by default generates the exported requirements.txt file with `-e` and that breaks pip with `-t` parameter
(used to install all requirements in a specific folder). In order to fix that we remove all `-e` from the generated file but,
for that to work you need to add the git dependencies in a specific way.

Instead of:

```toml
[tool.poetry.dependencies]
bottle = {git = "git@github.com/bottlepy/bottle.git", tag = "0.12.16"}
```

Use:

```toml
[tool.poetry.dependencies]
bottle = {git = "https://git@github.com/bottlepy/bottle.git", tag = "0.12.16"}
```

Or, if you have an SSH key configured:

```toml
[tool.poetry.dependencies]
bottle = {git = "ssh://git@github.com/bottlepy/bottle.git", tag = "0.12.16"}
```

## Dealing with Lambda's size limitations

To help deal with potentially large dependencies (for example: `numpy`, `scipy`
and `scikit-learn`) there is support for compressing the libraries. This does
require a minor change to your code to decompress them. To enable this add the
following to your `serverless.yml`:

```yaml
custom:
  pythonRequirements:
    zip: true
```

and add this to your handler module before any code that imports your deps:

```python
try:
  import unzip_requirements
except ImportError:
  pass
```

### Slim Package

_Works on non 'win32' environments: Docker, WSL are included_
To remove the tests, information and caches from the installed packages,
enable the `slim` option. This will: `strip` the `.so` files, remove `__pycache__`
and `dist-info` directories as well as `.pyc` and `.pyo` files.

```yaml
custom:
  pythonRequirements:
    slim: true
```

#### Custom Removal Patterns

To specify additional directories to remove from the installed packages,
define a list of patterns in the serverless config using the `slimPatterns`
option and glob syntax. These patterns will be added to the default ones (`**/*.py[c|o]`, `**/__pycache__*`, `**/*.dist-info*`).
Note, the glob syntax matches against whole paths, so to match a file in any
directory, start your pattern with `**/`.

```yaml
custom:
  pythonRequirements:
    slim: true
    slimPatterns:
      - '**/*.egg-info*'
```

To overwrite the default patterns set the option `slimPatternsAppendDefaults` to `false` (`true` by default).

```yaml
custom:
  pythonRequirements:
    slim: true
    slimPatternsAppendDefaults: false
    slimPatterns:
      - '**/*.egg-info*'
```

This will remove all folders within the installed requirements that match
the names in `slimPatterns`

#### Option not to strip binaries

In some cases, stripping binaries leads to problems like "ELF load command address/offset not properly aligned", even when done in the Docker environment. You can still slim down the package without `*.so` files with

```yaml
custom:
  pythonRequirements:
    slim: true
    strip: false
```

### Lambda Layer

Another method for dealing with large dependencies is to put them into a
[Lambda Layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html).
Simply add the `layer` option to the configuration.

```yaml
custom:
  pythonRequirements:
    layer: true
```

The requirements will be zipped up and a layer will be created automatically.
Now just add the reference to the functions that will use the layer.

```yaml
functions:
  hello:
    handler: handler.hello
    layers:
      - { Ref: PythonRequirementsLambdaLayer }
```

If the layer requires additional or custom configuration, add them onto the `layer` option.

```yaml
custom:
  pythonRequirements:
    layer:
      name: ${self:provider.stage}-layerName
      description: Python requirements lambda layer
      compatibleRuntimes:
        - python3.7
      licenseInfo: GPLv3
      allowedAccounts:
        - '*'
```

## Omitting Packages

You can omit a package from deployment with the `noDeploy` option. Note that
dependencies of omitted packages must explicitly be omitted too.

This example makes it instead omit pytest:

```yaml
custom:
  pythonRequirements:
    noDeploy:
      - pytest
```

## Extra Config Options

### Caching

You can enable two kinds of caching with this plugin which are currently both ENABLED by default.
First, a download cache that will cache downloads that pip needs to compile the packages.
And second, a what we call "static caching" which caches output of pip after compiling everything for your requirements file.
Since generally `requirements.txt` files rarely change, you will often see large amounts of speed improvements when enabling the static cache feature.
These caches will be shared between all your projects if no custom `cacheLocation` is specified (see below).

_**Please note:** This has replaced the previously recommended usage of "--cache-dir" in the pipCmdExtraArgs_

```yaml
custom:
  pythonRequirements:
    useDownloadCache: true
    useStaticCache: true
```

### Other caching options

There are two additional options related to caching.
You can specify where in your system that this plugin caches with the `cacheLocation` option.
By default it will figure out automatically where based on your username and your OS to store the cache via the [appdirectory](https://www.npmjs.com/package/appdirectory) module.
Additionally, you can specify how many max static caches to store with `staticCacheMaxVersions`, as a simple attempt to limit disk space usage for caching.
This is DISABLED (set to 0) by default.
Example:

```yaml
custom:
  pythonRequirements:
    useStaticCache: true
    useDownloadCache: true
    cacheLocation: '/home/user/.my_cache_goes_here'
    staticCacheMaxVersions: 10
```

### Extra pip arguments

You can specify extra arguments [supported by pip](https://pip.pypa.io/en/stable/reference/pip_install/#options) to be passed to pip like this:

```yaml
custom:
  pythonRequirements:
    pipCmdExtraArgs:
      - --compile
```

### Extra Docker arguments

You can specify extra arguments to be passed to [docker build](https://docs.docker.com/engine/reference/commandline/build/) during the build step, and [docker run](https://docs.docker.com/engine/reference/run/) during the dockerized pip install step:

```yaml
custom:
  pythonRequirements:
    dockerizePip: true
    dockerBuildCmdExtraArgs: ['--build-arg', 'MY_GREAT_ARG=123']
    dockerRunCmdExtraArgs: ['-v', '${env:PWD}:/my-app']
```

### Customize requirements file name

[Some `pip` workflows involve using requirements files not named
`requirements.txt`](https://www.kennethreitz.org/essays/a-better-pip-workflow).
To support these, this plugin has the following option:

```yaml
custom:
  pythonRequirements:
    fileName: requirements-prod.txt
```

### Per-function requirements

If you have different python functions, with different sets of requirements, you can avoid
including all the unecessary dependencies of your functions by using the following structure:

```shell
├── serverless.yml
├── function1
│      ├── requirements.txt
│      └── index.py
└── function2
       ├── requirements.txt
       └── index.py
```

With the content of your `serverless.yml` containing:

```yml
package:
  individually: true

functions:
  func1:
    handler: index.handler
    module: function1
  func2:
    handler: index.handler
    module: function2
```

The result is 2 zip archives, with only the requirements for function1 in the first one, and only
the requirements for function2 in the second one.

Quick notes on the config file:

- The `module` field must be used to tell the plugin where to find the `requirements.txt` file for
  each function.
- The `handler` field must not be prefixed by the folder name (already known through `module`) as
  the root of the zip artifact is already the path to your function.

### Customize Python executable

Sometimes your Python executable isn't available on your `$PATH` as `python2.7`
or `python3.6` (for example, windows or using pyenv).
To support this, this plugin has the following option:

```yaml
custom:
  pythonRequirements:
    pythonBin: /opt/python3.6/bin/python
```

### Vendor library directory

For certain libraries, default packaging produces too large an installation,
even when zipping. In those cases it may be necessary to tailor make a version
of the module. In that case you can store them in a directory and use the
`vendor` option, and the plugin will copy them along with all the other
dependencies to install:

```yaml
custom:
  pythonRequirements:
    vendor: ./vendored-libraries
functions:
  hello:
    handler: hello.handler
    vendor: ./hello-vendor # The option is also available at the function level
```

## Manual invocations

The `.requirements` and `requirements.zip`(if using zip support) files are left
behind to speed things up on subsequent deploys. To clean them up, run
`sls requirements clean`. You can also create them (and `unzip_requirements` if
using zip support) manually with `sls requirements install`.

## Invalidate requirements caches on package

If you are using your own Python library, you have to cleanup
`.requirements` on any update. You can use the following option to cleanup
`.requirements` everytime you package.

```yaml
custom:
  pythonRequirements:
    invalidateCaches: true
```

## :apple::beer::snake: Mac Brew installed Python notes

[Brew wilfully breaks the `--target` option with no seeming intention to fix it](https://github.com/Homebrew/brew/pull/821)
which causes issues since this uses that option. There are a few easy workarounds for this:

- Install Python from [python.org](https://www.python.org/downloads/) and specify it with the
  [`pythonBin` option](#customize-python-executable).

OR

- Create a virtualenv and activate it while using serverless.

OR

- [Install Docker](https://docs.docker.com/docker-for-mac/install/) and use the [`dockerizePip` option](#cross-compiling).

Also, [brew seems to cause issues with pipenv](https://github.com/dschep/lambda-decorators/issues/4#event-1418928080),
so make sure you install pipenv using pip.

## :checkered_flag: Windows `dockerizePip` notes

For usage of `dockerizePip` on Windows do Step 1 only if running serverless on windows, or do both Step 1 & 2 if running serverless inside WSL.

1. [Enabling shared volume in Windows Docker Taskbar settings](https://forums.docker.com/t/docker-data-volumes-and-windows-mounts/31499/2)
1. [Installing the Docker client on Windows Subsystem for Linux (Ubuntu)](https://medium.com/@sebagomez/installing-the-docker-client-on-ubuntus-windows-subsystem-for-linux-612b392a44c4)

## Native Code Dependencies During Build

Some Python packages require extra OS dependencies to build successfully. To deal with this, replace the default image (`lambci/lambda:python3.6`) with a `Dockerfile` like:

```dockerfile
FROM lambci/lambda:build-python3.6

# Install your dependencies
RUN yum -y install mysql-devel
```

Then update your `serverless.yml`:

```yaml
custom:
  pythonRequirements:
    dockerFile: Dockerfile
```

## Native Code Dependencies During Runtime

Some Python packages require extra OS libraries (`*.so` files) at runtime. You need to manually include these files in the root directory of your Serverless package. The simplest way to do this is to use the `dockerExtraFiles` option.

For instance, the `mysqlclient` package requires `libmysqlclient.so.1020`. If you use the Dockerfile from the previous section, add an item to the `dockerExtraFiles` option in your `serverless.yml`:

```yaml
custom:
  pythonRequirements:
    dockerExtraFiles:
      - /usr/lib64/mysql57/libmysqlclient.so.1020
```

Then verify the library gets included in your package:

```bash
sls package
zipinfo .serverless/xxx.zip
```

If you can't see the library, you might need to adjust your package include/exclude configuration in `serverless.yml`.

## Optimising packaging time

If you wish to exclude most of the files in your project, and only include the source files of your lambdas and their dependencies you may well use an approach like this:

```yaml
package:
  individually: false
  include:
    - './src/lambda_one/**'
    - './src/lambda_two/**'
  exclude:
    - '**'
```

This will be very slow. Serverless adds a default `"&ast;&ast;"` include. If you are using the `cacheLocation` parameter to this plugin, this will result in all of the cached files' names being loaded and then subsequently discarded because of the exclude pattern. To avoid this happening you can add a negated include pattern, as is observed in <https://github.com/serverless/serverless/pull/5825>.

Use this approach instead:

```yaml
package:
  individually: false
  include:
    - '!./**'
    - './src/lambda_one/**'
    - './src/lambda_two/**'
  exclude:
    - '**'
```

## Contributors

- [@dschep](https://github.com/dschep) - Lead developer & original maintainer
- [@azurelogic](https://github.com/azurelogic) - logging & documentation fixes
- [@abetomo](https://github.com/abetomo) - style & linting
- [@angstwad](https://github.com/angstwad) - `deploy --function` support
- [@mather](https://github.com/mather) - the cache invalidation option
- [@rmax](https://github.com/rmax) - the extra pip args option
- [@bsamuel-ui](https://github.com/bsamuel-ui) - Python 3 support, current maintainer
- [@suxor42](https://github.com/suxor42) - fixing permission issues with Docker on Linux
- [@mbeltran213](https://github.com/mbeltran213) - fixing docker linux -u option bug
- [@Tethik](https://github.com/Tethik) - adding usePipenv option
- [@miketheman](https://github.com/miketheman) - fixing bug with includes when using zip option, update eslint,
- [@wattdave](https://github.com/wattdave) - fixing bug when using `deploymentBucket`
- [@heri16](https://github.com/heri16) - fixing Docker support in Windows
- [@ryansb](https://github.com/ryansb) - package individually support
- [@cgrimal](https://github.com/cgrimal) - Private SSH Repo access in Docker, `dockerFile` option
  to build a custom docker image, real per-function requirements, and the `vendor` option
- [@kichik](https://github.com/kichik) - Imposed windows & `noDeploy` support,
  switched to adding files straight to zip instead of creating symlinks, and
  improved pip cache support when using docker.
- [@dee-me-tree-or-love](https://github.com/dee-me-tree-or-love) - the `slim` package option
- [@alexjurkiewicz](https://github.com/alexjurkiewicz) - [docs about docker workflows](#native-code-dependencies-during-build)
- [@andrewfarley](https://github.com/andrewfarley) - Implemented download caching and static caching
- [@bweigel](https://github.com/bweigel) - adding the `slimPatternsAppendDefaults` option & fixing per-function packaging when some functions don't have requirements & Porting tests from bats to js!
- Poetry support
	- [@squaresurf](https://github.com/squaresurf)
	- [@drice](https://github.com/drice)
	- [@ofercaspi](https://github.com/ofercaspi)
	- [@tpansino](https://github.com/tpansino)
- [@david-mk-lawrence](https://github.com/david-mk-lawrence) - added Lambda Layer support
- [@bryantbriggs](https://github.com/bryantbiggs) - Fixing CI/CD
- [@jacksgt](https://github.com/jacksgt) - Fixing pip issues
- [@lephuongbg](https://github.com/lephuongbg) - Fixing single function deployment
