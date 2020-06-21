const path = require('path');
const paths = require('./paths');
const {
  appendWebpackPlugin,
  getWebpackPlugin,
  removeWebpackPlugin,
} = require('@rescripts/utilities');

module.exports = (pages) => (config) => {
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
};
