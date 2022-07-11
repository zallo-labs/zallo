import { getMerkleTree, getMultiProof } from 'lib';
import { allSigners, deployTestSafe, expect, toSafeGroupTest } from './util';

describe('Merkle proof', () => {
  it('lib should generate valid multi-proof', async () => {
    const group = toSafeGroupTest(
      [allSigners[0].address, 100],
      [allSigners[1].address, 50],
    );

    const approvers = [group.approvers[0], group.approvers[1]];
    const { tree, root, proof, rawProofFlags, proofLeaves } = getMultiProof(
      group,
      approvers,
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
    const { safe, group } = await deployTestSafe([125, 2, 28]);

    const tree = getMerkleTree(group);

    expect(await safe.getGroupMerkleRoot(group.ref)).to.eq(tree.getHexRoot());
  });

  it('should verify valid multi-proof', async () => {
    const { safe, group } = await deployTestSafe([40, 60, 20]);

    const approvers = group.approvers.slice(0, 2);
    const { proof, proofFlags, root } = getMultiProof(group, approvers);

    const tx = safe.verifyMultiProof(root, proof, proofFlags, approvers);

    await expect(tx).to.eventually.not.be.rejected;
  });

  it('should reject an invalid multi-proof', async () => {
    const { safe, group, others } = await deployTestSafe([
      50, 20, 10, 40, 30, 5,
    ]);

    const validApprovers = group.approvers.slice(0, 2);
    const { proof, proofFlags, root } = getMultiProof(group, validApprovers);

    const invalidApprovers = [{ addr: others[0].address, weight: 100 }];
    const tx = safe.verifyMultiProof(root, proof, proofFlags, invalidApprovers);

    await expect(tx).to.eventually.be.rejected;
  });
});
