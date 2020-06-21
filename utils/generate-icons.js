const { appendWebpackPlugin } = require('@rescripts/utilities');
const sharp = require('sharp');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (iconPath, sizes = []) => (config) =>
  appendWebpackPlugin(
    new CopyPlugin({
      patterns: sizes.map((size) => ({
        from: iconPath,
        to: `static/icons/[name]@${size}.[hash:8].[ext]`,
        flatten: true,
        transform: (content) => sharp(content).resize(size).toBuffer(),
      })),
    }),
    config
  );
