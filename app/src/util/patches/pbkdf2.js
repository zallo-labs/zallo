// Patch Ethers to use react-native-quick-crypto for pbkdf2
// https://github.com/ethers-io/ethers.js/issues/2250#issuecomment-1321134111
// TODO: Ethers v6 - use .register - https://github.com/ethers-io/ethers.js/issues/2250#issuecomment-1409804087
const crypto = require('./crypto');
exports.pbkdf2 = crypto.pbkdf2Sync;
