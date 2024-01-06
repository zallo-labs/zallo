import chardet from 'chardet';

import { Hex, isHex } from 'lib';

const MIN_CONFIDENCE = 5;

const BYTE_PATTERN = /([0-9a-f]{2})/gi;
const hexStringToBytes = (v: Hex) => {
  const parts = [...(v.slice(2).match(BYTE_PATTERN) ?? [])];
  return new Uint8Array(parts.map((v) => parseInt(v, 16)));
};

export const tryDecodeHexString = (hex: Hex): string | undefined => {
  if (!isHex(hex)) return undefined;

  const bytes = hexStringToBytes(hex);
  if (bytes.length === 0) return '';

  const matches = chardet.analyse(bytes);
  const guess = matches.find(
    (guess) => guess.confidence >= MIN_CONFIDENCE && Buffer.isEncoding(guess.name),
  );

  if (guess) return Buffer.from(bytes).toString(guess.name as BufferEncoding);
};
