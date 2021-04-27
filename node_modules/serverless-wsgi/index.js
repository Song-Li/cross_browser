"use strict";

const BbPromise = require("bluebird");
const _ = require("lodash");
const path = require("path");
const fse = BbPromise.promisifyAll(require("fs-extra"));
const child_process = require("child_process");
const hasbin = require("hasbin");

class ServerlessWSGI {
  validate() {
    return new BbPromise(resolve => {
      let handlersFixed = false;

      _.each(this.serverless.service.functions, func => {
        if (func.handler == "wsgi.handler") {
          func.handler = "wsgi_handler.handler";
          handlersFixed = true;
        }
      });

      if (handlersFixed) {
        this.serverless.cli.log(
          'Warning: Please change "wsgi.handler" to "wsgi_handler.handler" in serverless.yml'
        );
        this.serverless.cli.log(
          'Warning: Using "wsgi.handler" still works but has been deprecated and will be removed'
        );
        this.serverless.cli.log(
          "Warning: More information at https://github.com/logandk/serverless-wsgi/issues/84"
        );
      }

      this.enableRequirements = !_.includes(
        this.serverless.service.plugins,
        "serverless-python-requirements"
      );
      this.pipArgs = null;
      this.appPath = this.serverless.config.servicePath;

      if (
        this.serverless.service.custom &&
        this.serverless.service.custom.wsgi
      ) {
        if (this.serverless.service.custom.wsgi.app) {
          this.wsgiApp = this.serverless.service.custom.wsgi.app;
          this.appPath = path.dirname(path.join(this.appPath, this.wsgiApp));
        }

        if (_.isBoolean(this.serverless.service.custom.wsgi.packRequirements)) {
          this.enableRequirements = this.serverless.service.custom.wsgi.packRequirements;
        }

        this.pipArgs = this.serverless.service.custom.wsgi.pipArgs;
      }

      if (this.enableRequirements) {
        this.requirementsInstallPath = path.join(this.appPath, ".requirements");
      }

      this.packageRootPath = this.serverless.config.servicePath;

      if (
        this.serverless.service.package &&
        this.serverless.service.package.individually &&
        this.serverless.config.servicePath != this.appPath
      ) {
        let handler = _.find(
          this.serverless.service.functions,
          fun => fun.handler == "wsgi_handler.handler"
        );

        // serverless-python-requirements supports packaging individual functions
        // by specifying a Python module, in which case the handler needs to be installed
        // in the module root, rather than the service root
        if (handler && handler.module) {
          this.packageRootPath = this.appPath;
          this.wsgiApp = path.basename(this.wsgiApp);
        }
      }

      resolve();
    });
  }

  configurePackaging() {
    return new BbPromise(resolve => {
      this.serverless.service.package = this.serverless.service.package || {};
      this.serverless.service.package.include =
        this.serverless.service.package.include || [];
      this.serverless.service.package.exclude =
        this.serverless.service.package.exclude || [];

      this.serverless.service.package.include = _.union(
        this.serverless.service.package.include,
        _.map(
          ["wsgi_handler.py", "serverless_wsgi.py", ".serverless-wsgi"],
          artifact =>
            path.join(
              path.relative(
                this.serverless.config.servicePath,
                this.packageRootPath
              ),
              artifact
            )
        )
      );

      if (this.enableRequirements) {
        this.serverless.service.package.exclude.push(
          path.join(
            path.relative(this.serverless.config.servicePath, this.appPath),
            ".requirements/**"
          )
        );
      }

      resolve();
    });
  }

  locatePython() {
    return new BbPromise(resolve => {
      if (
        this.serverless.service.custom &&
        this.serverless.service.custom.wsgi &&
        this.serverless.service.custom.wsgi.pythonBin
      ) {
        this.serverless.cli.log(
          `Using Python specified in "pythonBin": ${
            this.serverless.service.custom.wsgi.pythonBin
          }`
        );

        this.pythonBin = this.serverless.service.custom.wsgi.pythonBin;
        return resolve();
      }

      if (this.serverless.service.provider.runtime) {
        if (hasbin.sync(this.serverless.service.provider.runtime)) {
          this.serverless.cli.log(
            `Using Python specified in "runtime": ${
              this.serverless.service.provider.runtime
            }`
          );

          this.pythonBin = this.serverless.service.provider.runtime;
          return resolve();
        } else {
          this.serverless.cli.log(
            `Python executable not found for "runtime": ${
              this.serverless.service.provider.runtime
            }`
          );
        }
      }

      this.serverless.cli.log("Using default Python executable: python");

      this.pythonBin = "python";

      resolve();
    });
  }

  getWsgiHandlerConfiguration() {
    const config = { app: this.wsgiApp };

    if (_.isArray(this.serverless.service.custom.wsgi.textMimeTypes)) {
      config.text_mime_types = this.serverless.service.custom.wsgi.textMimeTypes;
    }

    return config;
  }

  packWsgiHandler(verbose = true) {
    if (!this.wsgiApp) {
      this.serverless.cli.log(
        "Warning: No WSGI app specified, omitting WSGI handler from package"
      );
      return BbPromise.resolve();
    }

    if (verbose) {
      this.serverless.cli.log("Packaging Python WSGI handler...");
    }

    return BbPromise.all([
      fse.copyAsync(
        path.resolve(__dirname, "wsgi_handler.py"),
        path.join(this.packageRootPath, "wsgi_handler.py")
      ),
      fse.copyAsync(
        path.resolve(__dirname, "serverless_wsgi.py"),
        path.join(this.packageRootPath, "serverless_wsgi.py")
      ),
      fse.writeFileAsync(
        path.join(this.packageRootPath, ".serverless-wsgi"),
        JSON.stringify(this.getWsgiHandlerConfiguration())
      )
    ]);
  }

  packRequirements() {
    return new BbPromise((resolve, reject) => {
      if (!this.enableRequirements) {
        return resolve();
      }

      let args = [path.resolve(__dirname, "requirements.py")];

      if (this.pipArgs) {
        args.push("--pip-args");
        args.push(this.pipArgs);
      }

      if (this.wsgiApp) {
        args.push(path.resolve(__dirname, "requirements.txt"));
      }

      const requirementsFile = path.join(this.appPath, "requirements.txt");

      if (fse.existsSync(requirementsFile)) {
        args.push(requirementsFile);
      } else {
        if (!this.wsgiApp) {
          return resolve();
        }
      }

      args.push(this.requirementsInstallPath);

      this.serverless.cli.log("Packaging required Python packages...");

      const res = child_process.spawnSync(this.pythonBin, args, {'encoding': 'utf8'});
      if (res.error) {
        if (res.error.code == "ENOENT") {
          return reject(
            `Unable to run Python executable: ${
              this.pythonBin
            }. Use the "pythonBin" option to set your Python executable explicitly.`
          );
        } else {
          return reject(res.error);
        }
      }

      if (res.status != 0) {
        return reject(res.stderr);
      }

      resolve();
    });
  }

  linkRequirements() {
    return new BbPromise((resolve, reject) => {
      if (!this.enableRequirements) {
        return resolve();
      }

      if (fse.existsSync(this.requirementsInstallPath)) {
        this.serverless.cli.log("Linking required Python packages...");

        fse.readdirSync(this.requirementsInstallPath).map(file => {
          let relativePath = path.join(
            path.relative(this.serverless.config.servicePath, this.appPath),
            file
          );

          this.serverless.service.package.include.push(relativePath);
          this.serverless.service.package.include.push(`${relativePath}/**`);

          try {
            fse.symlinkSync(`${this.requirementsInstallPath}/${file}`, file);
          } catch (exception) {
            let linkConflict = false;
            try {
              linkConflict =
                fse.readlinkSync(file) !==
                `${this.requirementsInstallPath}/${file}`;
            } catch (e) {
              linkConflict = true;
            }
            if (linkConflict) {
              return reject(
                `Unable to link dependency '${file}' ` +
                  "because a file by the same name exists in this service"
              );
            }
          }
        });
      }

      resolve();
    });
  }

  checkWerkzeugPresent() {
    return new BbPromise(resolve => {
      if (!this.wsgiApp || !this.enableRequirements) {
        return resolve();
      }

      const hasWerkzeug = _.includes(fse.readdirSync(this.appPath), "werkzeug");

      if (!hasWerkzeug) {
        this.serverless.cli.log(
          "Warning: Could not find werkzeug, please add it to your requirements.txt"
        );
      }

      resolve();
    });
  }

  unlinkRequirements() {
    return new BbPromise(resolve => {
      if (!this.enableRequirements) {
        return resolve();
      }

      if (fse.existsSync(this.requirementsInstallPath)) {
        this.serverless.cli.log("Unlinking required Python packages...");

        fse.readdirSync(this.requirementsInstallPath).map(file => {
          if (fse.existsSync(file)) {
            fse.unlinkSync(file);
          }
        });
      }

      resolve();
    });
  }

  cleanRequirements() {
    if (!this.enableRequirements) {
      return BbPromise.resolve();
    }

    return fse.removeAsync(this.requirementsInstallPath);
  }

  cleanup() {
    const artifacts = [
      "wsgi_handler.py",
      "serverless_wsgi.py",
      ".serverless-wsgi"
    ];

    return BbPromise.all(
      _.map(artifacts, artifact =>
        fse.removeAsync(path.join(this.packageRootPath, artifact))
      )
    );
  }

  loadEnvVars() {
    return new BbPromise(resolve => {
      const providerEnvVars = _.omitBy(
        this.serverless.service.provider.environment || {},
        _.isObject
      );
      _.merge(process.env, providerEnvVars);

      _.each(this.serverless.service.functions, func => {
        if (func.handler == "wsgi_handler.handler") {
          const functionEnvVars = _.omitBy(func.environment || {}, _.isObject);
          _.merge(process.env, functionEnvVars);
        }
      });

      resolve();
    });
  }

  serve() {
    return new BbPromise((resolve, reject) => {
      if (!this.wsgiApp) {
        return reject(
          'Missing WSGI app, please specify custom.wsgi.app. For instance, if you have a Flask application "app" in "api.py", set the Serverless custom.wsgi.app configuration option to: api.app'
        );
      }

      const port = this.options.port || 5000;
      const host = this.options.host || "localhost";
      const disable_threading = this.options["disable-threading"] || false;
      const num_processes = this.options["num-processes"] || 1;
      const ssl = this.options.ssl || false;

      var args = [
        path.resolve(__dirname, "serve.py"),
        this.packageRootPath,
        this.wsgiApp,
        port,
        host
      ];

      if (num_processes > 1) {
        args.push("--num-processes", num_processes);
      }

      if (disable_threading) {
        args.push("--disable-threading");
      }

      if (ssl) {
        args.push("--ssl");
      }

      var status = child_process.spawnSync(this.pythonBin, args, {
        stdio: "inherit"
      });
      if (status.error) {
        if (status.error.code == "ENOENT") {
          reject(
            `Unable to run Python executable: ${
              this.pythonBin
            }. Use the "pythonBin" option to set your Python executable explicitly.`
          );
        } else {
          reject(status.error);
        }
      } else {
        resolve();
      }
    });
  }

  findHandler() {
    return _.findKey(
      this.serverless.service.functions,
      fun => fun.handler == "wsgi_handler.handler"
    );
  }

  invokeHandler(command, data, local) {
    const handlerFunction = this.findHandler();

    if (!handlerFunction) {
      return BbPromise.reject(
        "No functions were found with handler: wsgi_handler.handler"
      );
    }

    // We're going to call the provider-agnostic invoke plugin, which has
    // no proper plugin-facing API. Instead, the current CLI options are modified
    // to match those of an invoke call.
    this.serverless.pluginManager.cliOptions.function = handlerFunction;
    this.serverless.pluginManager.cliOptions.data = JSON.stringify({
      "_serverless-wsgi": {
        command: command,
        data: data
      }
    });
    this.serverless.pluginManager.cliOptions.context = undefined;
    this.serverless.pluginManager.cliOptions.f = this.serverless.pluginManager.cliOptions.function;
    this.serverless.pluginManager.cliOptions.d = this.serverless.pluginManager.cliOptions.data;
    this.serverless.pluginManager.cliOptions.c = this.serverless.pluginManager.cliOptions.context;

    // The invoke plugin prints the response to the console as JSON. When invoking commands
    // remotely, we get a string back and we want it to appear in the console as it would have
    // if it was invoked locally.
    //
    // Thus, console.log is temporarily hijacked to capture the output and parse it as JSON. This
    // hack is needed to avoid having to call the provider-specific invoke plugins.
    let output = "";

    /* eslint-disable no-console */
    const native_log = console.log;
    console.log = msg => (output += msg + "\n");

    return this.serverless.pluginManager
      .run(local ? ["invoke", "local"] : ["invoke"])
      .then(
        () =>
          new BbPromise((resolve, reject) => {
            output = _.trimEnd(output, "\n");
            try {
              output = JSON.parse(output);
            } catch (e) {
              // Swallow exception
            }
            if (_.isArray(output) && output.length == 2) {
              const return_code = output[0];
              const output_data = _.isString(output[1])
                ? _.trimEnd(output[1], "\n")
                : output[1];
              if (return_code == 0) {
                native_log(output_data);
              } else {
                return reject(output_data);
              }
            } else {
              native_log(output);
            }
            return resolve();
          })
      )
      .finally(() => {
        console.log = native_log;
      });
    /* eslint-enable no-console */
  }

  command(local) {
    let data = null;

    if (this.options.command) {
      data = this.options.command;
    } else if (this.options.file) {
      data = fse.readFileSync(this.options.file, "utf8");
    } else {
      return BbPromise.reject(
        "Please provide either a command (-c) or a file (-f)"
      );
    }

    return this.invokeHandler("command", data, local);
  }

  exec(local) {
    let data = null;

    if (this.options.command) {
      data = this.options.command;
    } else if (this.options.file) {
      data = fse.readFileSync(this.options.file, "utf8");
    } else {
      return BbPromise.reject(
        "Please provide either a command (-c) or a file (-f)"
      );
    }

    return this.invokeHandler("exec", data, local);
  }

  manage(local) {
    return this.invokeHandler("manage", this.options.command, local);
  }

  flask(local) {
    return this.invokeHandler("flask", this.options.command, local);
  }

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      wsgi: {
        usage: "Deploy Python WSGI applications",
        lifecycleEvents: ["wsgi"],

        commands: {
          serve: {
            usage: "Serve the WSGI application locally",
            lifecycleEvents: ["serve"],
            options: {
              port: {
                usage: "Local server port, defaults to 5000",
                shortcut: "p"
              },
              host: {
                usage: "Server host, defaults to 'localhost'"
              },
              "disable-threading": {
                usage: "Disables multi-threaded mode"
              },
              "num-processes": {
                usage: "Number of processes for server, defaults to 1"
              },
              ssl: {
                usage: "Enable local serving using HTTPS"
              }
            }
          },
          install: {
            usage: "Install WSGI handler and requirements for local use",
            lifecycleEvents: ["install"]
          },
          clean: {
            usage: "Remove cached requirements",
            lifecycleEvents: ["clean"]
          },
          command: {
            usage: "Execute shell commands or scripts remotely",
            lifecycleEvents: ["command"],
            options: {
              command: {
                usage: "Command to execute",
                shortcut: "c"
              },
              file: {
                usage: "Path to a shell script to execute",
                shortcut: "f"
              }
            },
            commands: {
              local: {
                usage: "Execute shell commands or scripts locally",
                lifecycleEvents: ["command"],
                options: {
                  command: {
                    usage: "Command to execute",
                    shortcut: "c"
                  },
                  file: {
                    usage: "Path to a shell script to execute",
                    shortcut: "f"
                  }
                }
              }
            }
          },
          exec: {
            usage: "Evaluate Python code remotely",
            lifecycleEvents: ["exec"],
            options: {
              command: {
                usage: "Python code to execute",
                shortcut: "c"
              },
              file: {
                usage: "Path to a Python script to execute",
                shortcut: "f"
              }
            },
            commands: {
              local: {
                usage: "Evaluate Python code locally",
                lifecycleEvents: ["exec"],
                options: {
                  command: {
                    usage: "Python code to execute",
                    shortcut: "c"
                  },
                  file: {
                    usage: "Path to a Python script to execute",
                    shortcut: "f"
                  }
                }
              }
            }
          },
          manage: {
            usage: "Run Django management commands remotely",
            lifecycleEvents: ["manage"],
            options: {
              command: {
                usage: "Management command",
                shortcut: "c",
                required: true
              }
            },
            commands: {
              local: {
                usage: "Run Django management commands locally",
                lifecycleEvents: ["manage"],
                options: {
                  command: {
                    usage: "Management command",
                    shortcut: "c",
                    required: true
                  }
                }
              }
            }
          },
          flask: {
            usage: "Run Flask CLI commands remotely",
            lifecycleEvents: ["flask"],
            options: {
              command: {
                usage: "Flask CLI command",
                shortcut: "c",
                required: true
              }
            },
            commands: {
              local: {
                usage: "Run Flask CLI commands locally",
                lifecycleEvents: ["flask"],
                options: {
                  command: {
                    usage: "Flask CLI command",
                    shortcut: "c",
                    required: true
                  }
                }
              }
            }
          }
        }
      }
    };

    const deployBeforeHook = () =>
      BbPromise.bind(this)
        .then(this.validate)
        .then(this.configurePackaging)
        .then(this.locatePython)
        .then(this.packWsgiHandler)
        .then(this.packRequirements)
        .then(this.linkRequirements)
        .then(this.checkWerkzeugPresent);

    const deployBeforeHookWithoutHandler = () =>
      BbPromise.bind(this)
        .then(this.validate)
        .then(this.configurePackaging)
        .then(this.locatePython)
        .then(this.packRequirements)
        .then(this.linkRequirements);

    const deployAfterHook = () =>
      BbPromise.bind(this)
        .then(this.validate)
        .then(this.unlinkRequirements)
        .then(this.cleanup);

    this.hooks = {
      "wsgi:wsgi": () => {
        this.serverless.cli.generateCommandsHelp(["wsgi"]);
        return BbPromise.resolve();
      },

      "wsgi:serve:serve": () =>
        BbPromise.bind(this)
          .then(this.validate)
          .then(this.locatePython)
          .then(this.loadEnvVars)
          .then(this.serve),

      "wsgi:install:install": deployBeforeHook,

      "wsgi:command:command": () =>
        BbPromise.bind(this)
          .then(this.validate)
          .then(() => this.command(false)),
      "wsgi:command:local:command": () =>
        BbPromise.bind(this)
          .then(this.validate)
          .then(() => this.command(true)),
      "wsgi:exec:exec": () =>
        BbPromise.bind(this)
          .then(this.validate)
          .then(() => this.exec(false)),
      "wsgi:exec:local:exec": () =>
        BbPromise.bind(this)
          .then(this.validate)
          .then(() => this.exec(true)),
      "wsgi:manage:manage": () =>
        BbPromise.bind(this)
          .then(this.validate)
          .then(() => this.manage(false)),
      "wsgi:manage:local:manage": () =>
        BbPromise.bind(this)
          .then(this.validate)
          .then(() => this.manage(true)),
      "wsgi:flask:flask": () =>
        BbPromise.bind(this)
          .then(this.validate)
          .then(() => this.flask(false)),
      "wsgi:flask:local:flask": () =>
        BbPromise.bind(this)
          .then(this.validate)
          .then(() => this.flask(true)),

      "wsgi:clean:clean": () => deployAfterHook().then(this.cleanRequirements),

      "before:package:createDeploymentArtifacts": deployBeforeHook,
      "after:package:createDeploymentArtifacts": deployAfterHook,

      "before:deploy:function:packageFunction": () => {
        if (this.options.functionObj.handler == "wsgi_handler.handler") {
          return deployBeforeHook();
        } else {
          return deployBeforeHookWithoutHandler();
        }
      },
      "after:deploy:function:packageFunction": deployAfterHook,

      "before:offline:start:init": deployBeforeHook,
      "after:offline:start:end": deployAfterHook,

      "before:invoke:local:invoke": () => {
        const functionObj = this.serverless.service.getFunction(
          this.options.function
        );

        return BbPromise.bind(this)
          .then(this.validate)
          .then(() => {
            if (functionObj.handler == "wsgi_handler.handler") {
              return this.packWsgiHandler(false);
            } else {
              return BbPromise.resolve();
            }
          });
      },
      "after:invoke:local:invoke": () =>
        BbPromise.bind(this)
          .then(this.validate)
          .then(this.cleanup)
    };
  }
}

module.exports = ServerlessWSGI;
