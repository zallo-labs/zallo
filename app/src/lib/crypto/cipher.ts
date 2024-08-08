import crypto from 'crypto';
import { SALT_SIZE, derrivePasswordBasedKey } from './password';

const ALGO = 'aes-256-gcm';
const DATA_ENCODING = 'utf8';
const BUFFER_ENCODING = 'base64';
const IV_SIZE = 16;

const OFFSET = {
  salt: 0,
  iv: SALT_SIZE,
  tag: SALT_SIZE + IV_SIZE,
  encryptedData: SALT_SIZE + IV_SIZE + 16,
};

export async function createCipher(password: string | undefined = '') {
  const keys: Record<string, { key: Buffer; salt: Buffer }> = {};

  return {
    async encrypt(data: string) {
      const { key, salt } = await derrivePasswordBasedKey(password, null);

      const iv = crypto.randomBytes(IV_SIZE);
      const cipher = crypto.createCipheriv(ALGO, key, iv);

      const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
      const tag = cipher.getAuthTag();

      return Buffer.concat([salt, iv, tag, encryptedData]).toString(BUFFER_ENCODING);
    },
    async decrypt(encrypted: string) {
      const buf = Buffer.from(encrypted, BUFFER_ENCODING);

      const salt = buf.subarray(OFFSET.salt, OFFSET.iv);
      const iv = buf.subarray(OFFSET.iv, OFFSET.tag);
      const tag = buf.subarray(OFFSET.tag, OFFSET.encryptedData);
      const encryptedData = buf.subarray(OFFSET.encryptedData);

      const { key } = (keys[salt.toString('base64')] ??= await derrivePasswordBasedKey(
        password,
        salt,
      ));

      const decipher = crypto.createDecipheriv(ALGO, key, iv);
      decipher.setAuthTag(tag);

      return (
        decipher.update(encryptedData, undefined, DATA_ENCODING) + decipher.final(DATA_ENCODING)
      );
    },
  };
}

export type Cipher = Awaited<ReturnType<typeof createCipher>>;
