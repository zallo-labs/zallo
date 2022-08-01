import keccak256 from 'keccak256';
import MerkleTree from 'merkletreejs';
import { Account } from './account';
import { BoolArray, toBoolArray } from './boolArray';
import { Quorum, quorumToLeaf } from './quorum';

export const getMerkleTree = (account: Account): MerkleTree => {
  const leaves = account.quorums.map(quorumToLeaf);
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

export const getMultiProof = (account: Account, quorum: Quorum): MultiProof => {
  const tree = getMerkleTree(account);

  const proofLeaves = [quorumToLeaf(quorum)];
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
