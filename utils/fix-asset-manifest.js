const { editWebpackPlugin } = require('@rescripts/utilities');

module.exports = () => (config) =>
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
  );
