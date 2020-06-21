const { edit, getPaths } = require('@rescripts/utilities');

module.exports = () => (config) => {
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
};
