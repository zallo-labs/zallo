import crypto from 'crypto';

export const SALT_SIZE = 32;
const KEY_SIZE = 32;
const HASH_ENCODING = 'base64';

export function derrivePasswordBasedKey(password: string, salt?: Buffer) {
  const s = salt ?? crypto.randomBytes(SALT_SIZE);
  return new Promise<{ key: Buffer; salt: Buffer }>((resolve, reject) => {
    // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
    crypto.pbkdf2(password.normalize(), s, 600000, KEY_SIZE, 'sha256', (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve({ key, salt: s });
      }
    });
  });
}

export async function hashPassword(password: string) {
  const { key, salt } = await derrivePasswordBasedKey(password);

  return Buffer.concat([key, salt]).toString(HASH_ENCODING);
}

export async function verifyPassword(password: string, expectedHash: string) {
  const hashBuf = Buffer.from(expectedHash, HASH_ENCODING);
  const expectedKey = hashBuf.subarray(0, KEY_SIZE);
  const salt = hashBuf.subarray(KEY_SIZE);

  const { key } = await derrivePasswordBasedKey(password, salt);

  return expectedKey.equals(key);
}
