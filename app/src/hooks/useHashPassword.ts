import { useMemo } from 'react';
import { persistedAtom } from '~/lib/persistedAtom';
import crypto from 'crypto';
import { useAtomValue } from 'jotai';

const SALT = persistedAtom('salt', () => crypto.randomBytes(16).toString('hex'));

export function useHashPassword() {
  const salt = useAtomValue(SALT);

  return useMemo(
    () => (password: string) =>
      new Promise<string>((resolve, reject) => {
        // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
        crypto.pbkdf2(password.normalize(), salt, 210000, 64, 'sha512', (err, key) => {
          if (err) {
            reject(err);
          } else {
            resolve(key.toString('hex'));
          }
        });
      }),
    [salt],
  );
}
