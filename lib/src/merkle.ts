import keccak256 from 'keccak256';
import MerkleTree from 'merkletreejs';
import { Wallet } from './wallet';
import { BoolArray, toBoolArray } from './boolArray';
import { Quorum, quorumToLeaf, sortQuorums } from './quorum';

export const getMerkleTree = (wallet: Wallet): MerkleTree => {
  const leaves = sortQuorums(wallet.quorums).map(quorumToLeaf);
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

export const getMultiProof = (wallet: Wallet, quorum: Quorum): MultiProof => {
  const tree = getMerkleTree(wallet);

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
