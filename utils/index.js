const copyAssets = require('./copy-assets');
const fixAssetManifest = require('./fix-asset-manifest');
const fixOutput = require('./fix-output');
const locateContentScripts = require('./locate-content-scripts');
const generateHtml = require('./generate-html');
const generateIcons = require('./generate-icons');
const paths = require('./paths');

module.exports = {
  copyAssets,
  fixAssetManifest,
  fixOutput,
  locateContentScripts,
  generateHtml,
  generateIcons,
  paths,
};
