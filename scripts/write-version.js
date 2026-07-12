// Stamps public/version.json at build time (wired as the `prebuild` script).
// The client compares this against the value it saw at page load to detect
// that a newer deploy exists (stale-tab / stale-cache defense).
const fs = require('fs');
const path = require('path');

const version = Date.now().toString(36);
const outPath = path.join(__dirname, '..', 'public', 'version.json');

fs.writeFileSync(outPath, JSON.stringify({ version }) + '\n');
console.log(`version.json stamped: ${version}`);
