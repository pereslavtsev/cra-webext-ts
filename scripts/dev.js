const concurrently = require('concurrently');

concurrently(
  [
    {
      command: 'rimraf dist && rescripts start',
      name: 'CRA',
      prefixColor: 'cyan',
      env: { BROWSER: 'none' },
    },
    {
      command:
        'wait-on ./dist/manifest.json && web-ext --config=web-ext-config.dev.js run -t chromium',
      name: 'web-ext',
      prefixColor: 'yellow',
    },
  ],
  {}
).then();

// Begin reading from stdin so the process does not exit imidiately
process.stdin.resume();

process.on('SIGINT', () => {
  const { exec } = require('child_process');
  exec('rimraf dist', () => {
    process.exit();
  });
});
