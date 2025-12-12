// utils/provablyFair.js
const crypto = require('crypto');

exports.generateServerSeed = () => { /* ... */ };
exports.hashSeed = (seed) => { /* ... */ };
exports.getCrashMultiplier = (serverSeed, clientSeed, nonce) => { 
    // ... (Công thức tính toán từ Hash Seed)
    return Math.max(1.00, crashPoint); 
};
