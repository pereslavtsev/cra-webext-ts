const {
  appendWebpackPlugin,
  edit,
  editWebpackPlugin,
  getPaths,
  getWebpackPlugin,
  prependWebpackPlugin,
  replace,
  removeWebpackPlugin,
} = require('@rescripts/utilities');
const paths = require('react-scripts/config/paths');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const CopyPlugin = require('copy-webpack-plugin');

// Add new paths
paths.appBackgroundSrc = path.resolve(paths.appSrc, 'background');
paths.appContentSrc = path.resolve(paths.appSrc, 'content');
paths.appOptionsSrc = path.resolve(paths.appSrc, 'options');
paths.appPopupSrc = path.resolve(paths.appSrc, 'popup');

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

// Load a base extension config from manifest.json
const appManifest = require(paths.appManifest);

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
        content: hasContent ? paths.appContentSrc : undefined,
        background: hasBackground ? paths.appBackgroundSrc : undefined,
        options: hasOptions ? paths.appOptionsSrc : undefined,
        popup: hasPopup ? paths.appPopupSrc : undefined,
      },
      entryPaths,
      config
    );
  },
  (config) => {
    if (config.mode === 'production') {
      return config;
    }
    const outputPaths = getPaths(
      (inQuestion) =>
        inQuestion && inQuestion.filename && inQuestion.chunkFilename,
      config
    );
    return edit(
      (o) => {
        o.filename = o.filename.replace(/bundle/, '[name]');
        return o;
      },
      outputPaths,
      config
    );
  },
  (config) =>
    editWebpackPlugin(
      (p) => {
        p.opts.generate = (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = Object.values(entrypoints)
            .flat()
            .filter((fileName) => !fileName.endsWith('.map'));

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        };
        return p;
      },
      'ManifestPlugin',
      config
    ),
  (config) => {
    const htmlWebpackPlugin = getWebpackPlugin('HtmlWebpackPlugin', config);

    // Remove a HtmlWebpackPlugin instance for index.html
    config = removeWebpackPlugin('HtmlWebpackPlugin', config);

    // Append multiple html files for each entry
    Object.entries(pages).forEach(([entry, filename]) => {
      const newHtmlWebpackPlugin = Object.assign(
        Object.create(Object.getPrototypeOf(htmlWebpackPlugin)),
        {
          options: Object.assign({}, htmlWebpackPlugin.options, {
            filename,
            template: path.resolve(paths.appPublic, filename),
            chunks: [entry],
          }),
        }
      );
      config = appendWebpackPlugin(newHtmlWebpackPlugin, config);
    });
    return config;
  },
  (config) => {
    if (config.mode !== 'development') {
      return config;
    }
    return prependWebpackPlugin(
      new CopyPlugin({
        patterns: [
          {
            from: paths.appPublic,
            globOptions: {
              dots: true,
              ignore: [
                // Ignore user's manifest.json
                'manifest.json',
                'icon.png',
                // Ignore UI pages
                ...Object.entries(pages).map(([, filename]) => filename),
              ],
            },
          },
        ],
      }),
      config
    );
  },
  (config) => {
    const manifestPlugin = getWebpackPlugin('ManifestPlugin', config);

    config = appendWebpackPlugin(
      new CopyPlugin({
        patterns: ICON_SIZES.map((size) => ({
          from: path.resolve(paths.appPublic, 'icon.png'),
          to: `static/icons/[name]@${size}.[hash:8].[ext]`,
          flatten: true,
          transform: (content) => sharp(content).resize(size).toBuffer(),
        })),
      }),
      config
    );
    const opts = Object.assign({}, manifestPlugin.opts, {
      fileName: 'manifest.json',
      generate: (seed, files, entrypoints) => {
        const backgroundFiles = entrypoints.background.filter(
          (fileName) => !fileName.endsWith('.map')
        );
        const contentScripts = entrypoints.content.filter(
          (fileName) => !fileName.endsWith('.map')
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
        return Object.assign({}, appManifest, {
          icons,
          background: {
            scripts: backgroundFiles,
          },
          content_scripts: [
            {
              js: contentScripts,
              matches: ['*://*/*'],
            },
          ],
        });
      },
    });
    const newManifestPlugin = Object.assign(
      Object.create(Object.getPrototypeOf(manifestPlugin)),
      { opts }
    );
    return appendWebpackPlugin(newManifestPlugin, config);
  },
];
