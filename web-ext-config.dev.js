const config = require('./web-ext-config');

module.exports = Object.assign({}, config, {
  verbose: true,
  sourceDir: 'dist',
});
