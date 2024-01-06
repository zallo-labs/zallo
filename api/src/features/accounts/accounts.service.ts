import { UserInputError } from '@nestjs/apollo';
import { InjectQueue } from '@nestjs/bullmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import {
  ACCOUNT_IMPLEMENTATION,
  ACCOUNT_PROXY_FACTORY,
  Address,
  asAddress,
  asPolicyKey,
  deployAccountProxy,
  getProxyAddress,
  Hex,
  Policy,
  randomDeploySalt,
  UAddress,
} from 'lib';
import e from '~/edgeql-js';
import { selectAccount } from '~/features/accounts/accounts.util';
import { and } from '~/features/database/database.util';
import { TypedQueue } from '~/features/util/bull/bull.util';
import { getApprover, getUserCtx } from '~/request/ctx';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ContractsService } from '../contracts/contracts.service';
import { ShapeFunc } from '../database/database.select';
import { DatabaseService } from '../database/database.service';
import { FaucetService } from '../faucet/faucet.service';
import { PoliciesService } from '../policies/policies.service';
import { inputAsPolicy } from '../policies/policies.util';
import { NetworksService } from '../util/networks/networks.service';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { AccountEvent, CreateAccountInput, UpdateAccountInput } from './accounts.input';
import { ACTIVATIONS_QUEUE } from './activations.queue';

export const getAccountTrigger = (address: UAddress) => `account.${address}`;
export const getAccountApproverTrigger = (approver: Address) => `account.approver.${approver}`;
export interface AccountSubscriptionPayload {
  account: UAddress;
  event: AccountEvent;
}

@Injectable()
export class AccountsService {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private pubsub: PubsubService,
    private contracts: ContractsService,
    private faucet: FaucetService,
    @Inject(forwardRef(() => PoliciesService))
    private policies: PoliciesService,
    @InjectQueue(ACTIVATIONS_QUEUE.name)
    private activations: TypedQueue<typeof ACTIVATIONS_QUEUE>,
    private accountsCache: AccountsCacheService,
  ) {}

  unique = (address: UAddress) =>
    e.shape(e.Account, () => ({
      filter_single: { address },
    }));

  selectUnique(address: UAddress | undefined, shape?: ShapeFunc<typeof e.Account>) {
    const accounts = getUserCtx().accounts;
    if (accounts.length === 0) return null;

    return this.db.query(
      e.select(e.Account, (a) => ({
        filter_single: address ? { address } : { id: accounts[0].id },
        ...shape?.(a),
      })),
    );
  }

  select(_filter: Record<string, never>, shape?: ShapeFunc<typeof e.Account>) {
    return this.db.query(
      e.select(e.Account, (a) => ({
        ...shape?.(a),
        id: true,
      })),
    );
  }

  private labelPattern = /^[0-9a-zA-Z$-]{4,40}$/;
  async labelAvailable(label: string): Promise<boolean> {
    if (!this.labelPattern.exec(label)) return false;

    const selectedAccount = e.select(e.Account, () => ({ filter_single: { label } }));

    return e
      .select(e.op('not', e.op('exists', selectedAccount)))
      .run(this.db.DANGEROUS_superuserClient);
  }

  async createAccount({
    chain: chainKey = 'zksync-goerli',
    label,
    policies: policyInputs,
  }: CreateAccountInput) {
    const network = this.networks.get(chainKey);
    const approver = getApprover();

    if (!policyInputs.find((p) => p.approvers.includes(approver)))
      throw new UserInputError('User must be included in at least one policy');

    const implementation = ACCOUNT_IMPLEMENTATION.address[chainKey];
    const salt = randomDeploySalt();
    const policies = policyInputs.map((p, i) => inputAsPolicy(asPolicyKey(i), p));

    const account = await getProxyAddress({
      network,
      factory: ACCOUNT_PROXY_FACTORY.address[chainKey],
      implementation: implementation,
      salt,
      policies,
    });

    // The account id must be in the user's list of accounts prior to starting the transaction for the globals to be set correctly
    const id = uuid();
    await this.accountsCache.addCachedAccount({
      approver,
      account: { id: id, address: account },
    });

    await this.db.transaction(async (db) => {
      await e
        .insert(e.Account, {
          id,
          address: account,
          label,
          isActive: false,
          implementation,
          salt,
        })
        .run(db);

      for (const [i, policy] of policyInputs.entries()) {
        await this.policies.create({
          ...policy,
          account,
          key: asPolicyKey(i),
          skipProposal: true,
        });
      }
    });

    await this.activateAccount(account, implementation, salt, policies);
    this.contracts.addAccountAsVerified(asAddress(account));
    this.faucet.requestTokens(account);
    this.publishAccount({ account, event: AccountEvent.create });
    this.setAsPrimaryAccountIfNotConfigured(id);

    return { id, address: account };
  }

  async updateAccount({ account: address, label, photoUri }: UpdateAccountInput) {
    const r = await e
      .update(e.Account, () => ({
        set: {
          label,
          photoUri: photoUri?.href,
        },
        filter_single: { address },
      }))
      .run(this.db.client);

    if (!r) throw new UserInputError(`Must be a member of the account to update it`);

    this.publishAccount({ account: address, event: AccountEvent.update });
  }

  private async activateAccount(
    account: UAddress,
    implementation: Address,
    salt: Hex,
    policies: Policy[],
  ) {
    const network = this.networks.get(account);
    const { transactionHash } = (
      await network.useWallet(async (wallet) =>
        deployAccountProxy({
          network,
          wallet,
          factory: ACCOUNT_PROXY_FACTORY.address[network.key],
          implementation,
          salt,
          policies,
        }),
      )
    )._unsafeUnwrap(); // TODO: handle failed deployments

    await this.activations.add('', { account, transaction: transactionHash });
  }

  async publishAccount(payload: AccountSubscriptionPayload) {
    const { account } = payload;

    // Publish events to all users with access to the account
    const approvers = await this.db.query(
      e.select(e.Account, () => ({
        filter_single: { address: account },
        approvers: {
          address: true,
        },
      })).approvers.address,
    );

    await Promise.all([
      this.pubsub.publish<AccountSubscriptionPayload>(getAccountTrigger(account), payload),
      ...approvers.map((approver) =>
        this.pubsub.publish<AccountSubscriptionPayload>(
          getAccountApproverTrigger(asAddress(approver)),
          payload,
        ),
      ),
    ]);
  }

  async setAsPrimaryAccountIfNotConfigured(accountId: string) {
    return this.db.query(
      e.update(e.User, (u) => ({
        filter: and(
          e.op(u.id, '=', e.global.current_user.id),
          e.op('not', e.op('exists', u.primaryAccount)),
        ),
        set: {
          primaryAccount: selectAccount(accountId),
        },
      })),
    );
  }
}
