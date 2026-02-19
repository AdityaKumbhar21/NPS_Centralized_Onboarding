const crypto = require('crypto');

// Key must be 32 bytes for AES-256. Pad/truncate env key or fall back to a default dev key.
const getKey = () => {
  const raw = process.env.ENCRYPTION_KEY || 'dev_fallback_key_do_not_use_prod';
  return Buffer.from(raw.padEnd(32, '0').slice(0, 32));
};

// Encrypt: generates a fresh random 16-byte IV each time, prepends it to the hex output
// Format: <32-char IV hex><ciphertext hex>
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + encrypted;
};

// Decrypt: extracts IV from the first 32 hex chars, decrypts the rest
const decrypt = (encryptedWithIv) => {
  const iv = Buffer.from(encryptedWithIv.slice(0, 32), 'hex');
  const encrypted = encryptedWithIv.slice(32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const maskAadhaar = (aadhaar) => aadhaar.replace(/.(?=.{4})/g, 'X');

module.exports = { encrypt, decrypt, maskAadhaar };