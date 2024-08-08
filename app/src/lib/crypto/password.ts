import crypto from 'crypto';
import { Platform } from 'react-native';

export const SALT_SIZE = 32;
const KEY_SIZE = 32;
const HASH_ENCODING = 'base64';

const ITERATIONS = Platform.select({
  // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
  default: 600000,
  // Performs terribly for some reason on Android; TODO: test on iOS
  // This is not a big deal as it is not used to encrypt data on native
  native: 100,
});

export function derrivePasswordBasedKey(password: string, salt: Buffer | null) {
  salt ??= crypto.randomBytes(SALT_SIZE);
  return new Promise<{ key: Buffer; salt: Buffer }>((resolve, reject) => {
    crypto.pbkdf2(password.normalize(), salt, ITERATIONS, KEY_SIZE, 'sha256', (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve({ key, salt });
      }
    });
  });
}

export async function hashPassword(password: string) {
  const { key, salt } = await derrivePasswordBasedKey(password, null);

  return Buffer.concat([key, salt]).toString(HASH_ENCODING);
}

export async function verifyPassword(password: string, expectedHash: string) {
  const hashBuf = Buffer.from(expectedHash, HASH_ENCODING);
  const expectedKey = hashBuf.subarray(0, KEY_SIZE);
  const salt = hashBuf.subarray(KEY_SIZE);

  const { key } = await derrivePasswordBasedKey(password, salt);

  return expectedKey.equals(key);
}
