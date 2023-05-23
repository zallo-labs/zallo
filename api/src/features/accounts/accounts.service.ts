import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { Address, DeploySalt, Policy, asHex, asPolicyKey, randomDeploySalt } from 'lib';
import { ShapeFunc } from '../database/database.select';
import { AccountEvent, CreateAccountInput, UpdateAccountInput } from './accounts.input';
import { getUser } from '~/request/ctx';
import { UserInputError } from 'apollo-server-core';
import { CONFIG } from '~/config';
import { ProviderService } from '../util/provider/provider.service';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { ContractsService } from '../contracts/contracts.service';
import { FaucetService } from '../faucet/faucet.service';
import { PoliciesService } from '../policies/policies.service';
import { InjectQueue } from '@nestjs/bull';
import { ACCOUNTS_QUEUE, AccountActivationEvent } from './accounts.queue';
import { inputAsPolicy } from '../policies/policies.util';
import { Queue } from 'bull';
import { selectAccount } from './accounts.util';
import { UserAccountsService } from '../auth/userAccounts.service';
import { v1 as uuid1 } from 'uuid';

export const getAccountTrigger = (address: Address) => `account.${address}`;
export const getAccountUserTrigger = (user: Address) => `account.user.${user}`;
export interface AccountSubscriptionPayload {
  account: Address;
  event: AccountEvent;
}

@Injectable()
export class AccountsService {
  constructor(
    private db: DatabaseService,
    private provider: ProviderService,
    private pubsub: PubsubService,
    private contracts: ContractsService,
    private faucet: FaucetService,
    @Inject(forwardRef(() => PoliciesService))
    private policies: PoliciesService,
    @InjectQueue(ACCOUNTS_QUEUE.name)
    private activationQueue: Queue<AccountActivationEvent>,
    private userAccounts: UserAccountsService,
  ) {}

  unique = (address: Address) =>
    e.shape(e.Account, () => ({
      filter_single: { address },
    }));

  selectUnique(address: Address, shape?: ShapeFunc<typeof e.Account>) {
    return this.db.query(
      selectAccount(address, (a) => ({
        ...shape?.(a),
      })),
    );
  }

  select(_filter: {}, shape?: ShapeFunc<typeof e.Account>) {
    return this.db.query(
      e.select(e.Account, (a) => ({
        ...shape?.(a),
        id: true,
      })),
    );
  }

  async createAccount({ name, policies: policyInputs }: CreateAccountInput) {
    const user = getUser();

    if (!policyInputs.find((p) => p.approvers.includes(user)))
      throw new UserInputError('User must be included in at least one policy');

    const implementation = CONFIG.accountImplAddress;
    const salt = randomDeploySalt();
    const policyKeys = policyInputs.map((p, i) => asPolicyKey(p.key ?? i));
    const policies = policyInputs.map((p, i) => inputAsPolicy(policyKeys[i], p));

    const account = await this.provider.getProxyAddress({
      impl: implementation,
      salt,
      policies,
    });

    // The account id must be in the user's list of accounts prior to starting the transaction for the globals to be set correctly
    const accountId = uuid1();
    await this.userAccounts.add({ user, account: accountId });

    const id = await this.db.transaction(async (client) => {
      const { id } = await e
        .insert(e.Account, {
          id: accountId,
          address: account,
          name,
          isActive: false,
          implementation,
          salt,
        })
        .run(client);

      await Promise.all(
        policyInputs.map((policy, i) =>
          this.policies.create({
            ...policy,
            account,
            accountId: id,
            key: policyKeys[i],
            skipProposal: true,
          }),
        ),
      );

      return id;
    });

    this.publishAccount({ account, event: AccountEvent.create });
    await this.activateAccount(account, implementation, salt, policies);
    this.contracts.addAccountAsVerified(account);
    this.faucet.requestTokens(account);

    return { id, address: account };
  }

  async updateAccount({ address, name }: UpdateAccountInput) {
    const r = await e
      .update(e.Account, () => ({
        set: {
          name,
        },
        filter_single: { address },
      }))
      .run(this.db.client);

    if (!r) throw new UserInputError(`Must be a member of the account to update it`);

    this.publishAccount({ account: address, event: AccountEvent.update });
  }

  private async activateAccount(
    account: Address,
    implementation: Address,
    salt: DeploySalt,
    policies: Policy[],
  ) {
    const { transaction, account: deployedAccount } = await this.provider.deployProxy({
      impl: implementation,
      salt,
      policies,
    });

    if (account !== deployedAccount.address)
      throw new Error(
        `Deployed account address didn't match stored address; expected '${account}', actual '${deployedAccount.address}'`,
      );

    await this.activationQueue.add({ account, transaction: asHex(transaction.hash) });
  }

  async publishAccount(payload: AccountSubscriptionPayload) {
    const { account } = payload;

    // Publish events to all users with access to the account
    const users = await e
      .select(
        e.op(
          'distinct',
          e.select(e.Policy, (p) => ({
            filter: e.op(p.account.address, '=', account),
            users: e.op(p.state.approvers.address, 'union', p.draft.approvers.address),
          })).users,
        ),
      )
      .run(this.db.DANGEROUS_superuserClient);

    await Promise.all([
      this.pubsub.publish<AccountSubscriptionPayload>(getAccountTrigger(account), payload),
      ...[...users].map((user) =>
        this.pubsub.publish<AccountSubscriptionPayload>(
          getAccountUserTrigger(user as Address),
          payload,
        ),
      ),
    ]);
  }
}
