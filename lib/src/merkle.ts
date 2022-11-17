import keccak256 from 'keccak256';
import MerkleTree from 'merkletreejs';
import { getUserMerkleRoot, User } from './user';
import { BoolArray, toBoolArray } from './boolArray';
import { UserConfig, userConfigToLeaf } from './userConfig';

export const getMerkleTree = (user: User): MerkleTree => {
  const leaves = getUserMerkleRoot(user);

  return new MerkleTree(leaves, keccak256, { sort: true });
};

export const getUserConfigProof = (user: User, config: UserConfig): Buffer[] => {
  const tree = getMerkleTree(user);
  const leaf = userConfigToLeaf(config);

  return tree.getProof(leaf);
};

export interface MultiProof {
  tree: MerkleTree;
  root: Buffer;
  proof: Buffer[];
  proofFlags: BoolArray;
  rawProofFlags: boolean[];
  proofLeaves: Buffer[];
}

export const getMultiProof = (user: User, config: UserConfig): MultiProof => {
  const tree = getMerkleTree(user);

  const proofLeaves = [userConfigToLeaf(config)];
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
