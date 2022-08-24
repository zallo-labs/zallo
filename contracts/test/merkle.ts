import {
  Wallet,
  getMerkleTree,
  getMultiProof,
  randomWalletRef,
  toQuorum,
  sortQuorums,
} from 'lib';
import { allSigners, deployTestAccount, expect } from './util';

describe('Merkle proof', () => {
  it('lib should generate valid multi-proof', async () => {
    const wallet: Wallet = {
      ref: randomWalletRef(),
      quorums: sortQuorums([
        toQuorum([allSigners[0].address, allSigners[1].address]),
        toQuorum([allSigners[2].address, allSigners[3].address]),
      ]),
    };
    const quorum = wallet.quorums[0];

    const { tree, root, proof, rawProofFlags, proofLeaves } = getMultiProof(
      wallet,
      quorum,
    );

    const verified = tree.verifyMultiProofWithFlags(
      root,
      proofLeaves,
      proof,
      rawProofFlags,
    );
    expect(verified).to.eq(true);
  });

  it('should generated valid merkle root', async () => {
    const { account, wallet } = await deployTestAccount();

    const tree = getMerkleTree(wallet);

    expect(await account.getWalletMerkleRoot(wallet.ref)).to.eq(
      tree.getHexRoot(),
    );
  });

  it('should verify valid multi-proof', async () => {
    const { account, wallet, quorum } = await deployTestAccount();

    const { proof, proofFlags, root } = getMultiProof(wallet, quorum);

    const tx = account.verifyMultiProof(root, proof, proofFlags, quorum);

    await expect(tx).to.eventually.not.be.rejected;
  });

  it('should reject an invalid multi-proof', async () => {
    const {
      account,
      wallet,
      quorum: validQuorum,
      others,
    } = await deployTestAccount();

    const { proof, proofFlags, root } = getMultiProof(wallet, validQuorum);

    const invalidQuorum = toQuorum(others.slice(0, 3));
    const tx = account.verifyMultiProof(root, proof, proofFlags, invalidQuorum);

    await expect(tx).to.eventually.be.rejected;
  });
});
