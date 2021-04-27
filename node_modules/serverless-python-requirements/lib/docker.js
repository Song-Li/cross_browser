const { spawnSync } = require('child_process');
const isWsl = require('is-wsl');
const fse = require('fs-extra');
const path = require('path');

/**
 * Helper function to run a docker command
 * @param {string[]} options
 * @return {Object}
 */
function dockerCommand(options) {
  const cmd = 'docker';
  const ps = spawnSync(cmd, options, { encoding: 'utf-8' });
  if (ps.error) {
    if (ps.error.code === 'ENOENT') {
      throw new Error('docker not found! Please install it.');
    }
    throw new Error(ps.error);
  } else if (ps.status !== 0) {
    throw new Error(ps.stderr);
  }
  return ps;
}

/**
 * Build the custom Docker image
 * @param {string} dockerFile
 * @param {string[]} extraArgs
 * @return {string} The name of the built docker image.
 */
function buildImage(dockerFile, extraArgs) {
  const imageName = 'sls-py-reqs-custom';
  const options = ['build', '-f', dockerFile, '-t', imageName];

  if (Array.isArray(extraArgs)) {
    options.push(...extraArgs);
  } else {
    throw new Error('dockerRunCmdExtraArgs option must be an array');
  }

  options.push('.');

  dockerCommand(options);
  return imageName;
}

/**
 * Find a file that exists on all projects so we can test if Docker can see it too
 * @param {string} servicePath
 * @return {string} file name
 */
function findTestFile(servicePath) {
  if (fse.pathExistsSync(path.join(servicePath, 'serverless.yml'))) {
    return 'serverless.yml';
  }
  if (fse.pathExistsSync(path.join(servicePath, 'serverless.yaml'))) {
    return 'serverless.yaml';
  }
  if (fse.pathExistsSync(path.join(servicePath, 'serverless.json'))) {
    return 'serverless.json';
  }
  if (fse.pathExistsSync(path.join(servicePath, 'requirements.txt'))) {
    return 'requirements.txt';
  }
  throw new Error(
    'Unable to find serverless.{yml|yaml|json} or requirements.txt for getBindPath()'
  );
}

/**
 * Test bind path to make sure it's working
 * @param {string} bindPath
 * @return {boolean}
 */
function tryBindPath(serverless, bindPath, testFile) {
  const debug = process.env.SLS_DEBUG;
  const options = [
    'run',
    '--rm',
    '-v',
    `${bindPath}:/test`,
    'alpine',
    'ls',
    `/test/${testFile}`,
  ];
  try {
    if (debug) serverless.cli.log(`Trying bindPath ${bindPath} (${options})`);
    const ps = dockerCommand(options);
    if (debug) serverless.cli.log(ps.stdout.trim());
    return ps.stdout.trim() === `/test/${testFile}`;
  } catch (err) {
    if (debug) serverless.cli.log(`Finding bindPath failed with ${err}`);
    return false;
  }
}

/**
 * Get bind path depending on os platform
 * @param {object} serverless
 * @param {string} servicePath
 * @return {string} The bind path.
 */
function getBindPath(serverless, servicePath) {
  // Determine bind path
  if (process.platform !== 'win32' && !isWsl) {
    return servicePath;
  }

  // test docker is available
  dockerCommand(['version']);

  // find good bind path for Windows
  let bindPaths = [];
  let baseBindPath = servicePath.replace(/\\([^\s])/g, '/$1');
  let drive;
  let path;

  bindPaths.push(baseBindPath);
  if (baseBindPath.startsWith('/mnt/')) {
    // cygwin "/mnt/C/users/..."
    baseBindPath = baseBindPath.replace(/^\/mnt\//, '/');
  }
  if (baseBindPath[1] == ':') {
    // normal windows "c:/users/..."
    drive = baseBindPath[0];
    path = baseBindPath.substring(3);
  } else if (baseBindPath[0] == '/' && baseBindPath[2] == '/') {
    // gitbash "/c/users/..."
    drive = baseBindPath[1];
    path = baseBindPath.substring(3);
  } else {
    throw new Error(`Unknown path format ${baseBindPath.substr(10)}...`);
  }

  bindPaths.push(`/${drive.toLowerCase()}/${path}`); // Docker Toolbox (seems like Docker for Windows can support this too)
  bindPaths.push(`${drive.toLowerCase()}:/${path}`); // Docker for Windows
  // other options just in case
  bindPaths.push(`/${drive.toUpperCase()}/${path}`);
  bindPaths.push(`/mnt/${drive.toLowerCase()}/${path}`);
  bindPaths.push(`/mnt/${drive.toUpperCase()}/${path}`);
  bindPaths.push(`${drive.toUpperCase()}:/${path}`);

  const testFile = findTestFile(servicePath);

  for (let i = 0; i < bindPaths.length; i++) {
    const bindPath = bindPaths[i];
    if (tryBindPath(serverless, bindPath, testFile)) {
      return bindPath;
    }
  }

  throw new Error('Unable to find good bind path format');
}

/**
 * Find out what uid the docker machine is using
 * @param {string} bindPath
 * @return {boolean}
 */
function getDockerUid(bindPath) {
  const options = [
    'run',
    '--rm',
    '-v',
    `${bindPath}:/test`,
    'alpine',
    'stat',
    '-c',
    '%u',
    '/bin/sh',
  ];
  const ps = dockerCommand(options);
  return ps.stdout.trim();
}

module.exports = { buildImage, getBindPath, getDockerUid };
