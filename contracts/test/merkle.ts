import {
  User,
  getMerkleTree,
  sortAddresses,
  getUserConfigProof,
  userConfigToLeaf,
  UserConfig,
  compareUserConfig,
} from 'lib';
import { allSigners, deployTestAccount, expect } from './util';

describe('Merkle proof', () => {
  it('lib should generate valid proof', async () => {
    const user: User = {
      addr: allSigners[0].address,
      configs: [
        {
          approvers: sortAddresses(
            allSigners.slice(1, 3).map((s) => s.address),
          ),
          spendingAllowlisted: false,
          limits: {},
        },
        {
          approvers: sortAddresses(
            allSigners.slice(4, 6).map((s) => s.address),
          ),
          spendingAllowlisted: false,
          limits: {},
        },
      ].sort(compareUserConfig),
    };
    const config = user.configs[0];

    const tree = getMerkleTree(user);
    const proof = getUserConfigProof(user, config);

    const verified = tree.verify(
      proof,
      userConfigToLeaf(config),
      tree.getRoot(),
    );

    expect(verified).to.eq(true);
  });

  it('should generated valid merkle root', async () => {
    const { account, user } = await deployTestAccount();

    const tree = getMerkleTree(user);

    expect(await account.getUserMerkleRoot(user.addr)).to.eq(tree.getHexRoot());
  });

  it('should reject an invalid multi-proof', async () => {
    const {
      account,
      user,
      config: validConfig,
      others,
    } = await deployTestAccount();

    const tree = getMerkleTree(user);
    const proof = getUserConfigProof(user, validConfig);

    const invalidConfig: UserConfig = {
      approvers: sortAddresses(others.slice(0, 3)),
      spendingAllowlisted: false,
      limits: {},
    };

    const isValid = await account.isValidProof(
      invalidConfig,
      proof,
      tree.getHexRoot(),
    );
    expect(isValid).to.be.false;
  });
});
