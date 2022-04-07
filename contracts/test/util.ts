import { ethers } from 'hardhat';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import chaiAsPromised from 'chai-as-promised';
import { BigNumberish } from '@ethersproject/bignumber';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { percentToFixedWeight } from 'lib';

chai.use(solidity);
chai.use(chaiAsPromised); // chaiAsPromised needs to be added last!
export { expect } from 'chai';

export interface Approver {
  addr: string;
  weight: BigNumberish;
}

export const toGroup = (approvers: { signer: SignerWithAddress; weight: number }[]) =>
  approvers
    .map((a) => ({
      addr: a.signer.address,
      weight: percentToFixedWeight(a.weight),
    }))
    .sort((a, b) => compareAddresses(a.addr, b.addr));

export const hashGroup = (group: Approver[]): string =>
  ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(['tuple(address addr, uint96 weight)[]'], [group]),
  );

export const compareAddresses = (a: string, b: string) => {
  const aArr = ethers.utils.arrayify(a);
  const bArr = ethers.utils.arrayify(b);

  if (aArr.length > bArr.length) return 1;

  for (let i = 0; i < aArr.length; i++) {
    const diff = aArr[i] - bArr[i];
    if (diff > 0) return 1;
    if (diff < 0) return -1;
  }

  return 0;
};

// const safe = await upgrades.deployProxy(
//   SafeFactory,
//   [
//     approvers.map((a, i) => ({
//       addr: a.address,
//       weight: weights[i],
//     })),
//   ],
//   { kind: "uups" }
// );
