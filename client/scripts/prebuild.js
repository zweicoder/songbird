const { exec, exit } = require('shelljs');
const path = require('path');

const packages = [
  '../node_modules/spotify-service',
];
const packagePaths = packages.map(e=> path.resolve(__dirname, e));

console.log('Executing prebuild script...');
packagePaths.forEach(package => {
  console.log(`Minimizing ${package}...`);
  const res = exec(`babel --presets=es2015 ${package} --out-dir ${package}`, {silent: true, async: true});
  if (res.code !== 0) {
    exit(res.code);
  }
});
