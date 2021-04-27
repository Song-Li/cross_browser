const fse = require('fs-extra');
const path = require('path');
const get = require('lodash.get');
const set = require('lodash.set');
const uniqBy = require('lodash.uniqby');
const BbPromise = require('bluebird');
const JSZip = require('jszip');
const { addTree, writeZip } = require('./zipTree');

BbPromise.promisifyAll(fse);

/**
 * Add the vendor helper to the current service tree.
 * @return {Promise}
 */
function addVendorHelper() {
  if (this.options.zip) {
    if (this.serverless.service.package.individually) {
      return BbPromise.resolve(this.targetFuncs)
        .map((f) => {
          if (!get(f, 'package.include')) {
            set(f, ['package', 'include'], []);
          }
          if (!get(f, 'module')) {
            set(f, ['module'], '.');
          }
          f.package.include.push('unzip_requirements.py');
          return f;
        })
        .then((functions) => uniqBy(functions, (func) => func.module))
        .map((f) => {
          this.serverless.cli.log(
            `Adding Python requirements helper to ${f.module}...`
          );

          return fse.copyAsync(
            path.resolve(__dirname, '../unzip_requirements.py'),
            path.join(this.servicePath, f.module, 'unzip_requirements.py')
          );
        });
    } else {
      this.serverless.cli.log('Adding Python requirements helper...');

      if (!get(this.serverless.service, 'package.include')) {
        set(this.serverless.service, ['package', 'include'], []);
      }

      this.serverless.service.package.include.push('unzip_requirements.py');

      return fse.copyAsync(
        path.resolve(__dirname, '../unzip_requirements.py'),
        path.join(this.servicePath, 'unzip_requirements.py')
      );
    }
  }
}

/**
 * Remove the vendor helper from the current service tree.
 * @return {Promise} the promise to remove the vendor helper.
 */
function removeVendorHelper() {
  if (this.options.zip && this.options.cleanupZipHelper) {
    if (this.serverless.service.package.individually) {
      return BbPromise.resolve(this.targetFuncs)
        .map((f) => {
          if (!get(f, 'module')) {
            set(f, ['module'], '.');
          }
          return f;
        })
        .then((funcs) => uniqBy(funcs, (f) => f.module))
        .map((f) => {
          this.serverless.cli.log(
            `Removing Python requirements helper from ${f.module}...`
          );
          return fse.removeAsync(
            path.join(this.servicePath, f.module, 'unzip_requirements.py')
          );
        });
    } else {
      this.serverless.cli.log('Removing Python requirements helper...');
      return fse.removeAsync(
        path.join(this.servicePath, 'unzip_requirements.py')
      );
    }
  }
}

/**
 * Zip up .serverless/requirements or .serverless/[MODULE]/requirements.
 * @return {Promise} the promise to pack requirements.
 */
function packRequirements() {
  if (this.options.zip) {
    if (this.serverless.service.package.individually) {
      return BbPromise.resolve(this.targetFuncs)
        .map((f) => {
          if (!get(f, 'module')) {
            set(f, ['module'], '.');
          }
          return f;
        })
        .then((funcs) => uniqBy(funcs, (f) => f.module))
        .map((f) => {
          this.serverless.cli.log(
            `Zipping required Python packages for ${f.module}...`
          );
          f.package.include.push(`${f.module}/.requirements.zip`);
          return addTree(
            new JSZip(),
            `.serverless/${f.module}/requirements`
          ).then((zip) => writeZip(zip, `${f.module}/.requirements.zip`));
        });
    } else {
      this.serverless.cli.log('Zipping required Python packages...');
      this.serverless.service.package.include.push('.requirements.zip');
      return addTree(new JSZip(), '.serverless/requirements').then((zip) =>
        writeZip(zip, path.join(this.servicePath, '.requirements.zip'))
      );
    }
  }
}

module.exports = { addVendorHelper, removeVendorHelper, packRequirements };
