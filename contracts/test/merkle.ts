import {
  Account,
  getMerkleTree,
  getMultiProof,
  randomAccountRef,
  toQuorum,
  toQuorums,
} from 'lib';
import { allSigners, deployTestSafe, expect } from './util';

describe('Merkle proof', () => {
  it('lib should generate valid multi-proof', async () => {
    const account: Account = {
      ref: randomAccountRef(),
      quorums: toQuorums([
        toQuorum([allSigners[0].address, allSigners[1].address]),
        toQuorum([allSigners[2].address, allSigners[3].address]),
      ]),
    };
    const quorum = account.quorums[0];

    const { tree, root, proof, rawProofFlags, proofLeaves } = getMultiProof(
      account,
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
    const { safe, account } = await deployTestSafe();

    const tree = getMerkleTree(account);

    expect(await safe.getAccountMerkleRoot(account.ref)).to.eq(
      tree.getHexRoot(),
    );
  });

  it('should verify valid multi-proof', async () => {
    const { safe, account, quorum } = await deployTestSafe();

    const { proof, proofFlags, root } = getMultiProof(account, quorum);

    const tx = safe.verifyMultiProof(root, proof, proofFlags, quorum);

    await expect(tx).to.eventually.not.be.rejected;
  });

  it('should reject an invalid multi-proof', async () => {
    const {
      safe,
      account,
      quorum: validQuorum,
      others,
    } = await deployTestSafe();

    const { proof, proofFlags, root } = getMultiProof(account, validQuorum);

    const invalidQuorum = toQuorum(others.slice(0, 3));
    const tx = safe.verifyMultiProof(root, proof, proofFlags, invalidQuorum);

    await expect(tx).to.eventually.be.rejected;
  });
});
