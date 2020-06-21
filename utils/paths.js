const path = require('path');
const paths = require('react-scripts/config/paths');

// Import CRA's "check required files" fmodule so we can fake it out completely
// https://blog.isquaredsoftware.com/2020/03/codebase-conversion-building-mean-with-cra/
const craCheckRequiredFilesPath = path.resolve(
  paths.appNodeModules,
  'react-dev-utils',
  'checkRequiredFiles.js'
);
require(craCheckRequiredFilesPath);

// Supply a fake implementation
require.cache[craCheckRequiredFilesPath].exports = () => true;

// Add new paths
paths.appBackgroundSrc = path.resolve(paths.appSrc, 'background');
paths.appContentSrc = path.resolve(paths.appSrc, 'content');
paths.appOptionsSrc = path.resolve(paths.appSrc, 'options');
paths.appPopupSrc = path.resolve(paths.appSrc, 'popup');

module.exports = paths;
