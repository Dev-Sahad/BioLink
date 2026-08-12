const fs = require('fs');
const path = require('path');

const wasmPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const b64 = fs.readFileSync(wasmPath).toString('base64');

const code = `const b64 = "${b64}";
module.exports = Buffer.from(b64, 'base64');
`;

fs.writeFileSync(path.join(__dirname, '..', 'wasmBuffer.js'), code);
fs.writeFileSync(path.join(__dirname, '..', 'database', 'wasmBuffer.js'), code);
console.log('Successfully generated wasmBuffer.js in root and database/!');
