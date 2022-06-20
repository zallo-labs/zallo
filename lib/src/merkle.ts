import { Groupish } from './group';
import keccak256 from 'keccak256';
import MerkleTree from 'merkletreejs';
import { Approverish, approversToLeaves } from './approver';
import { BoolArray, toBoolArray } from './boolArray';

export const getMerkleTree = (group: Groupish): MerkleTree => {
  const leaves = approversToLeaves(group.approvers);
  return new MerkleTree(leaves, keccak256, { sort: true });
};

export interface MultiProof {
  tree: MerkleTree;
  root: Buffer;
  proof: Buffer[];
  proofFlags: BoolArray;
  rawProofFlags: boolean[];
  proofLeaves: Buffer[];
}

export const getMultiProof = (
  group: Groupish,
  approvers: Approverish[],
): MultiProof => {
  const tree = getMerkleTree(group);

  const proofLeaves = approversToLeaves(approvers);
  const proof = tree.getMultiProof(proofLeaves);
  const rawProofFlags = tree.getProofFlags(proofLeaves, proof);

  return {
    tree,
    root: tree.getRoot(),
    proof,
    proofFlags: toBoolArray(rawProofFlags),
    rawProofFlags,
    proofLeaves,
  };
};
