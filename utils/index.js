const copyAssets = require('./copy-assets');
const fixAssetManifest = require('./fix-asset-manifest');
const fixOutput = require('./fix-output');
const generateHtml = require('./generate-html');
const generateIcons = require('./generate-icons');
const paths = require('./paths');

module.exports = {
  copyAssets,
  fixAssetManifest,
  fixOutput,
  generateHtml,
  generateIcons,
  paths,
};
