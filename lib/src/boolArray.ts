import { BigNumber, ethers } from 'ethers';
import { ZERO } from './bignum';

const SLOT = 256;
const HEADER = 32;
const HEADER_OFFSET = SLOT - HEADER;

export type BoolArray = BigNumber[];

const getIndexes = (index: number) => {
  const i = index + HEADER;

  return {
    arrIndex: Math.floor(i / SLOT),
    shift: SLOT - (i % SLOT) - 1,
  };
};

export const toBoolArray = (bools: boolean[]) => {
  const totalLen = bools.length + HEADER;
  const data = [...new Array(Math.ceil(totalLen / SLOT))].map(() => ZERO);

  for (let index = 0; index < bools.length; index++) {
    const { arrIndex, shift } = getIndexes(index);

    if (bools[index])
      data[arrIndex] = data[arrIndex].or(BigNumber.from(1).shl(shift));
  }

  const boolsLen = BigNumber.from(bools.length);
  const firstElement = ethers.utils.solidityPack(
    ['uint32', 'uint224'],
    [boolsLen, data[0]],
  );

  return [BigNumber.from(firstElement), ...data.slice(1)];
};

export const boolArrayLength = (bools: BoolArray) =>
  bools.length > 0 ? bools[0].shr(HEADER_OFFSET) : 0;

export const boolAtIndex = (bools: BoolArray, index: number) => {
  const { arrIndex, shift } = getIndexes(index);

  return bools[arrIndex].shr(shift).and(1).eq(1);
};
