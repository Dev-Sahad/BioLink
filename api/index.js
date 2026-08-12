const path = require('path');
const fs = require('fs');

// Ensure Vercel NFT traces sql-wasm.wasm into serverless function bundle
try {
  fs.readFileSync(path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm'));
} catch (e) {}

const app = require('../server');

module.exports = app;
