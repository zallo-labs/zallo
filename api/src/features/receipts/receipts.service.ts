import { Injectable } from '@nestjs/common';
import { ACCOUNT_ABI, Hex, isHex, tryOrIgnore } from 'lib';
import chardet from 'chardet';
import { decodeErrorResult, size } from 'viem';
import { AbiError } from 'abitype';

const MIN_GUESS_CONFIDENCE = 5;

const BYTE_PATTERN = /([0-9a-f]{2})/gi;
const hexStringToBytes = (v: Hex) => {
  const parts = [...(v.slice(2).match(BYTE_PATTERN) ?? [])];
  return new Uint8Array(parts.map((v) => parseInt(v, 16)));
};

const solidityBuiltinErrors = [
  {
    inputs: [
      {
        name: 'message',
        type: 'string',
      },
    ],
    name: 'Error',
    type: 'error',
  },
  {
    inputs: [
      {
        name: 'reason',
        type: 'uint256',
      },
    ],
    name: 'Panic',
    type: 'error',
  },
] satisfies AbiError[];

const ERRORS_ABI = [
  ...solidityBuiltinErrors,
  ...ACCOUNT_ABI.filter((item) => item.type === 'error'),
];

@Injectable()
export class ReceiptsService {
  decodeResponse(success: boolean, response: string | undefined): string | undefined {
    if (!response || !isHex(response) || size(response) === 0) return undefined;

    if (success) {
      return this.decodeValue(response);
    } else {
      const r = tryOrIgnore(() =>
        decodeErrorResult({
          abi: ERRORS_ABI,
          data: response,
        }),
      );
      if (!r) return undefined;

      const args = r.args?.map((arg) => this.decodeValue(arg) ?? arg).join('; ') ?? [];

      return `${r.errorName}: ${args.length > 1 ? '[' : ''}${args}${args.length > 1 ? ']' : ''}`;
    }
  }

  private decodeValue(value: Hex): string | undefined {
    if (size(value) === 0) return undefined;

    const bytes = hexStringToBytes(value);
    if (bytes.length === 0) return '';

    const matches = chardet.analyse(bytes);
    const guess = matches.find(
      (guess) => guess.confidence >= MIN_GUESS_CONFIDENCE && Buffer.isEncoding(guess.name),
    );

    if (guess) return Buffer.from(bytes).toString(guess.name as BufferEncoding);
  }
}
