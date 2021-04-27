const BbPromise = require('bluebird');
const fse = require('fs-extra');
const path = require('path');
const glob = require('glob-all');
const { getUserCachePath } = require('./shared');

BbPromise.promisifyAll(fse);

/**
 * clean up .requirements and .requirements.zip and unzip_requirements.py
 * @return {Promise}
 */
function cleanup() {
  const artifacts = ['.requirements'];
  if (this.options.zip) {
    if (this.serverless.service.package.individually) {
      this.targetFuncs.forEach((f) => {
        artifacts.push(path.join(f.module, '.requirements.zip'));
        artifacts.push(path.join(f.module, 'unzip_requirements.py'));
      });
    } else {
      artifacts.push('.requirements.zip');
      artifacts.push('unzip_requirements.py');
    }
  }

  return BbPromise.all(
    artifacts.map((artifact) =>
      fse.removeAsync(path.join(this.servicePath, artifact))
    )
  );
}

/**
 * Clean up static cache, remove all items in there
 * @return {Promise}
 */
function cleanupCache() {
  const cacheLocation = getUserCachePath(this.options);
  if (fse.existsSync(cacheLocation)) {
    if (this.serverless) {
      this.serverless.cli.log(`Removing static caches at: ${cacheLocation}`);
    }

    // Only remove cache folders that we added, just incase someone accidentally puts a weird
    // static cache location so we don't remove a bunch of personal stuff
    const promises = [];
    glob
      .sync([path.join(cacheLocation, '*slspyc/')], { mark: true, dot: false })
      .forEach((file) => {
        promises.push(fse.removeAsync(file));
      });
    return BbPromise.all(promises);
  } else {
    if (this.serverless) {
      this.serverless.cli.log(`No static cache found`);
    }
    return BbPromise.resolve();
  }
}

module.exports = { cleanup, cleanupCache };
