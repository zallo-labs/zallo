import { ethers } from 'ethers';
import { beforeEach } from 'mocha';
import {
  createTx,
  getDomain,
  hashTx,
  TestEIP712,
  TestEIP712__factory,
} from 'lib';
import { deployer, expect, wallet } from './util';

describe('EIP712', () => {
  let tester: TestEIP712;

  beforeEach(async () => {
    const artifact = await deployer.loadArtifact('TestEIP712');
    const contract = await deployer.deploy(artifact, []);
    await contract.deployed();

    tester = new TestEIP712__factory().attach(contract.address).connect(wallet);
  });

  it('Domain separator', async () => {
    const expected = ethers.utils._TypedDataEncoder.hashDomain(
      await getDomain(tester),
    );
    const actual = await tester.callStatic.domainSeparator();

    expect(actual).to.eq(expected);
  });

  it('txHash', async () => {
    const tx = createTx({
      to: wallet.address,
    });

    const expected = await hashTx(tx, tester);
    const actual = await tester.callStatic.hashTx(tx);

    expect(actual).to.eq(expected);
  });
});
