const isWsl = require('is-wsl');
const glob = require('glob-all');
const fse = require('fs-extra');

const getStripMode = (options) => {
  if (
    options.strip === false ||
    options.strip === 'false' ||
    options.slim === false ||
    options.slim === 'false'
  ) {
    return 'skip';
  } else if (options.dockerizePip) {
    return 'docker';
  } else if (
    (!isWsl && process.platform === 'win32') ||
    process.platform === 'darwin'
  ) {
    return 'skip';
  } else {
    return 'direct';
  }
};

const getStripCommand = (options, folderPath) => [
  'find',
  folderPath,
  '-name',
  '*.so',
  '-exec',
  'strip',
  '{}',
  ';',
];

const deleteFiles = (options, folderPath) => {
  let patterns = ['**/*.py[c|o]', '**/__pycache__*', '**/*.dist-info*'];
  if (options.slimPatterns) {
    if (
      options.slimPatternsAppendDefaults === false ||
      options.slimPatternsAppendDefaults == 'false'
    ) {
      patterns = options.slimPatterns;
    } else {
      patterns = patterns.concat(options.slimPatterns);
    }
  }
  for (const pattern of patterns) {
    for (const file of glob.sync(`${folderPath}/${pattern}`)) {
      fse.removeSync(file);
    }
  }
};

module.exports = {
  getStripMode,
  getStripCommand,
  deleteFiles,
};
