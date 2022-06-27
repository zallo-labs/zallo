import { BigNumber } from 'ethers';
import {
  BoolArray,
  boolArrayLength,
  boolAtIndex,
  TestSafe,
  toBoolArray,
} from 'lib';
import { before } from 'mocha';
import { deployTestSafe, expect } from './util';

describe('BoolArray', () => {
  let safe: TestSafe;
  const values = [true, true, false, true, false, false, true, true, true];
  const bools = toBoolArray(values);

  before(async () => {
    safe = (await deployTestSafe()).safe;
  });

  it('should successfully create a bool array', async () => {
    const expected = BigNumber.from("0x09d3800000000000000000000000000000000000000000000000000000");
    expect(bools[0]).to.eq(expected);
  })

  it('should succeed at reading the length', async () => {
    const expected = values.length;
    expect(boolArrayLength(bools)).to.eq(expected);
    expect(await safe.boolArrayLength(bools)).to.eq(expected);
  });

  it('should succeed at reading the value at an index', async () => {
    for (let i = 0; i < values.length; i++) {
      const expected = values[i];
      expect(boolAtIndex(bools, i)).to.eq(expected);
      expect(await safe.boolArrayAtIndex(bools, i)).to.eq(expected);
    }
  });

  it('should have a length of 0 when uninitialized', async () => {
    const emptyBools: BoolArray = [];
    const expected = 0;
    expect(boolArrayLength(emptyBools)).to.eq(expected);
    expect(await safe.boolArrayLength(emptyBools)).to.eq(expected);
  });
});
