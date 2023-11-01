import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { Address, DeploySalt, Policy, asHex, asPolicyKey, randomDeploySalt } from 'lib';
import { ShapeFunc } from '../database/database.select';
import {
  AccountEvent,
  ActivityInput,
  CreateAccountInput,
  UpdateAccountInput,
} from './accounts.input';
import { getApprover, getUserCtx } from '~/request/ctx';
import { UserInputError } from '@nestjs/apollo';
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
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { v1 as uuid1 } from 'uuid';

export const getAccountTrigger = (address: Address) => `account.${address}`;
export const getAccountApproverTrigger = (user: Address) => `account.user.${user}`;
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
    private accountsCache: AccountsCacheService,
  ) {}

  unique = (address: Address) =>
    e.shape(e.Account, () => ({
      filter_single: { address },
    }));

  selectUnique(address: Address | undefined, shape?: ShapeFunc<typeof e.Account>) {
    const accounts = getUserCtx().accounts;
    if (accounts.length === 0) return null;

    return this.db.query(
      e.select(e.Account, (a) => ({
        filter_single: address ? { address } : { id: accounts[0].id },
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
    const approver = getApprover();

    if (!policyInputs.find((p) => p.approvers.includes(approver)))
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
    const id = uuid1();
    await this.accountsCache.addCachedAccount({
      approver,
      account: { id: id, address: account },
    });

    await this.db.transaction(async (db) => {
      await e
        .insert(e.Account, {
          id,
          address: account,
          name,
          isActive: false,
          implementation,
          salt,
        })
        .run(db);

      for (const [i, policy] of policyInputs.entries()) {
        await this.policies.create({
          ...policy,
          account,
          key: policyKeys[i],
          skipProposal: true,
        });
      }
    });

    await this.activateAccount(account, implementation, salt, policies);
    this.contracts.addAccountAsVerified(account);
    this.faucet.requestTokens(account);
    this.publishAccount({ account, event: AccountEvent.create });

    return { id, address: account };
  }

  async updateAccount({ address, name, photoUri }: UpdateAccountInput) {
    const r = await e
      .update(e.Account, () => ({
        set: {
          name,
          photoUri: photoUri?.href,
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
    const approvers = (await this.db.query(
      e.select(e.Account, () => ({
        filter_single: { address: account },
        approvers: {
          address: true,
        },
      })).approvers.address,
    )) as Address[];

    await Promise.all([
      this.pubsub.publish<AccountSubscriptionPayload>(getAccountTrigger(account), payload),
      ...approvers.map((approver) =>
        this.pubsub.publish<AccountSubscriptionPayload>(
          getAccountApproverTrigger(approver),
          payload,
        ),
      ),
    ]);
  }
}
