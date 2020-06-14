const {edit, getPaths, replace, editWebpackPlugin, replaceWebpackPlugin, appendWebpackPlugin} = require('@rescripts/utilities')
const paths = require('react-scripts/config/paths')
const {resolve} = require('path')
const ManifestPlugin = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = config => {
    config.entry = {
        //'content-script': './my-content-script.js',
        background: resolve(paths.appSrc, 'background'),
        //options: path.join('src', 'options', 'index.tsx'),
        popup: resolve(paths.appSrc, 'popup'),
    }

    console.log('111', config.mode === 'production')

    config = replaceWebpackPlugin(
        new HtmlWebpackPlugin(
            Object.assign(
                {},
                {
                    inject: true,
                    filename: 'popup.html',
                    template: resolve(paths.appSrc, paths.appPublic, 'popup.html'),
                    chunks: ['popup']
                },
                config.mode === 'production'
                    ? {
                        minify: {
                            removeComments: true,
                            collapseWhitespace: true,
                            removeRedundantAttributes: true,
                            useShortDoctype: true,
                            removeEmptyAttributes: true,
                            removeStyleLinkTypeAttributes: true,
                            keepClosingSlash: true,
                            minifyJS: true,
                            minifyCSS: true,
                            minifyURLs: true,
                        },
                    }
                    : undefined
            )
        ),
        'HtmlWebpackPlugin', config
    )

    config = replaceWebpackPlugin(
        new ManifestPlugin({
            fileName: 'asset-manifest.json',
            publicPath: paths.publicUrlOrPath,
            generate: (seed, files, entrypoints) => {
                const manifestFiles = files.reduce((manifest, file) => {
                    manifest[file.name] = file.path;
                    return manifest;
                }, seed);
                const entrypointFiles = Object.values(entrypoints).flat().filter(
                    fileName => !fileName.endsWith('.map')
                );

                return {
                    files: manifestFiles,
                    entrypoints: entrypointFiles,
                };
            },
        })
        , 'ManifestPlugin', config)

    config = appendWebpackPlugin(

        new ManifestPlugin({
        fileName: 'manifest.json',
        publicPath: paths.publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
            // const manifestFiles = files.reduce((manifest, file) => {
            //     manifest[file.name] = file.path;
            //     return manifest;
            // }, seed);
            //

            const backgroundFiles = entrypoints.background.filter(
                fileName => !fileName.endsWith('.map')
            );

            //console.log('files', files)
            return {
                "short_name": "TypeWiki",
                "name": "TypeWiki Extension",
                "description": "Powerful MediaWiki editor",
                "version": "0.0.1",
                "manifest_version": 2,
                "browser_action": {
                    "default_title": "TypeWiki",
                    "default_popup": "popup.html"
                },
                "icons": {
                    "16": "logo192.png",
                    "48": "logo192.png",
                    "128": "logo192.png"
                },
                "permissions": ["storage"],
                "background": {
                    "scripts": backgroundFiles
                },
                // "content_scripts": [
                //     {
                //         "js": ["counter.js"],
                //         "matches": ["*://*/*"]
                //     }
                // ]
            };
        },
    }), config)

    // console.log('config', config.entry)
    return config
}