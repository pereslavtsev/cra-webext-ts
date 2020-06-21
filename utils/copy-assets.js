const { prependWebpackPlugin } = require('@rescripts/utilities');
const CopyPlugin = require('copy-webpack-plugin');
const paths = require('./paths');

module.exports = (pages) => (config) => {
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
};
