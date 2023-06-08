import { Injectable } from '@nestjs/common';
import {
  ErrorFragment,
  Interface,
  Result,
  defaultAbiCoder,
  hexDataLength,
  hexDataSlice,
} from 'ethers/lib/utils';
import { ACCOUNT_INTERFACE, Hex, isHex, tryOrIgnore } from 'lib';
import chardet from 'chardet';

const MIN_GUESS_CONFIDENCE = 5;

const BYTE_PATTERN = /([0-9a-f]{2})/gi;
const hexStringToBytes = (v: Hex) => {
  const parts = [...(v.slice(2).match(BYTE_PATTERN) ?? [])];
  return new Uint8Array(parts.map((v) => parseInt(v, 16)));
};

const FRAGMENTS: Record<string, { fragment: ErrorFragment; stringify?: (r: Result) => string }> =
  Object.fromEntries([
    // Error(string) & Panic(uint256) are forbidden inside ErrorFragment.from(...) for some reason
    [
      '0x08c379a0' /* Error(string) sighash */,
      { fragment: ErrorFragment.fromString('Reverted(string)'), stringify: (r: Result) => r[0] },
    ],
    [
      '0x4e487b71' /* Panic(uint256) sighash */,
      { fragment: ErrorFragment.fromString('Panicked(uint256)') },
    ],
    ...Object.values(ACCOUNT_INTERFACE.errors).map((fragment) => [
      Interface.getSighash(fragment),
      { fragment },
    ]),
  ]);

@Injectable()
export class ReceiptsService {
  decodeResponse(success: boolean, response: string | undefined): string | undefined {
    if (!response || !isHex(response) || hexDataLength(response) === 0) return undefined;

    if (success) {
      return this.decodeValue(response);
    } else {
      // Reverted
      const match = FRAGMENTS[hexDataSlice(response, 0, 4)];
      if (!match) return undefined;
      const { fragment, stringify } = match;

      const argsResult = tryOrIgnore(() =>
        defaultAbiCoder.decode(fragment.inputs, hexDataSlice(response, 4)),
      );
      if (!argsResult) return undefined;

      if (stringify) return stringify(argsResult);

      const args = argsResult.map((arg) => this.decodeValue(arg) ?? arg).join('; ');

      return `${fragment.name}: ${args.length > 1 ? '[' : ''}${args}${args.length > 1 ? ']' : ''}`;
    }
  }

  private decodeValue(value: Hex): string | undefined {
    if (hexDataLength(value) === 0) return undefined;

    const bytes = hexStringToBytes(value);
    if (bytes.length === 0) return '';

    const matches = chardet.analyse(bytes);
    const guess = matches.find(
      (guess) => guess.confidence >= MIN_GUESS_CONFIDENCE && Buffer.isEncoding(guess.name),
    );

    if (guess) return Buffer.from(bytes).toString(guess.name as BufferEncoding);
  }
}
