import {
  fixedWeightToPercent,
  percentToFixedWeight,
  WEIGHT_THRESHOLD,
} from 'lib';
import { expect, deployTestSafe } from './util';

describe('Weight', () => {
  it('weight threshold should match', async () => {
    const { safe } = await deployTestSafe();

    expect(await safe.threshold()).to.eq(WEIGHT_THRESHOLD);
  });

  it('percent -> weight -> percent should convert back to the original percentage', () => {
    const n = 35.25998833119;
    expect(fixedWeightToPercent(percentToFixedWeight(n))).to.eq(n);
  });
});
