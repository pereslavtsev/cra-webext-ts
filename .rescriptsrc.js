const {
  appendWebpackPlugin,
  getPaths,
  getWebpackPlugin,
  replace,
} = require('@rescripts/utilities');
const {
  copyAssets,
  fixAssetManifest,
  fixOutput,
  locateContentScripts,
  generateHtml,
  generateIcons,
  paths,
} = require('./utils');
const path = require('path');
const fs = require('fs');

// Load a base extension config from manifest.json
const appManifest = require(paths.appManifest);

const contentScripts = locateContentScripts(paths.appContentSrc);

const hasContent = fs.existsSync(paths.appContentSrc);
const hasBackground = fs.existsSync(paths.appBackgroundSrc);
const hasPopup =
  !!appManifest.browser_action && !!appManifest.browser_action.default_popup;
const hasOptions = !!appManifest.options_ui && !!appManifest.options_ui.page;

const pages = Object.assign(
  {},
  hasOptions ? { options: appManifest.options_ui.page } : undefined,
  hasPopup ? { popup: appManifest.browser_action.default_popup } : undefined
);

const ICON_SIZES = [16, 19, 38, 48, 128];

module.exports = [
  // Change CRA's entry paths into different entries
  (config) => {
    const entryPaths = getPaths(
      (inQuestion) =>
        inQuestion &&
        Array.isArray(inQuestion) &&
        inQuestion.includes(paths.appIndexJs),
      config
    );
    return replace(
      {
        background: hasBackground ? paths.appBackgroundSrc : undefined,
        options: hasOptions ? paths.appOptionsSrc : undefined,
        popup: hasPopup ? paths.appPopupSrc : undefined,
        ...contentScripts,
      },
      entryPaths,
      config
    );
  },
  fixAssetManifest(),
  fixOutput(),
  generateHtml(pages),
  copyAssets(pages),
  // Generate extension icons from the icon.png file
  generateIcons(path.resolve(paths.appPublic, 'icon.png'), ICON_SIZES),
  // Generate an extension manfifest.json file based on the user's manifest from public folder
  (config) => {
    const manifestPlugin = getWebpackPlugin('ManifestPlugin', config);
    const opts = Object.assign({}, manifestPlugin.opts, {
      fileName: 'manifest.json',
      generate: (seed, files, entrypoints) => {
        const backgroundFiles = entrypoints.background.filter(
          (fileName) => !fileName.endsWith('.map')
        );
        const contentScriptsFiles = Object.fromEntries(
          Object.keys(contentScripts).map((script) => [
            script,
            entrypoints[script].filter(
              (fileName) => !fileName.endsWith('.map')
            ),
          ])
        );
        const iconsFiles = files.filter((file) =>
          file.name.startsWith('static/icons/icon')
        );
        const icons = Object.fromEntries(
          ICON_SIZES.map((size) => {
            const iconFile = iconsFiles.find((file) =>
              file.name.includes(`icon@${size}`)
            );
            return [size, iconFile.path];
          })
        );
        return Object.assign(
          {},
          appManifest,
          {
            icons,
          },
          hasBackground
            ? {
                background: {
                  scripts: backgroundFiles,
                },
              }
            : {},
          hasContent
            ? {
                content_scripts: appManifest.content_scripts.map((cs) =>
                  Object.assign({}, cs, {
                    js: contentScriptsFiles[cs.js],
                  })
                ),
              }
            : {},
          config.mode === 'development'
            ? {
                content_security_policy:
                  "script-src 'self' http://localhost:*; object-src 'self'",
              }
            : {}
        );
      },
    });
    const newManifestPlugin = Object.assign(
      Object.create(Object.getPrototypeOf(manifestPlugin)),
      { opts }
    );
    return appendWebpackPlugin(newManifestPlugin, config);
  },
];
