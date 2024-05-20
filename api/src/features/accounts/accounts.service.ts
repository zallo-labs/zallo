import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import {
  Address,
  asPolicyKey,
  randomDeploySalt,
  getProxyAddress,
  UAddress,
  asAddress,
  ACCOUNT_IMPLEMENTATION,
  DEPLOYER,
} from 'lib';
import { ShapeFunc } from '../database/database.select';
import {
  AccountEvent,
  AccountsInput,
  CreateAccountInput,
  UpdateAccountInput,
} from './accounts.input';
import { getApprover, getUserCtx } from '~/request/ctx';
import { UserInputError } from '@nestjs/apollo';
import { NetworksService } from '../util/networks/networks.service';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { ContractsService } from '../contracts/contracts.service';
import { FaucetService } from '../faucet/faucet.service';
import { PoliciesService } from '../policies/policies.service';
import { inputAsPolicy } from '../policies/policies.util';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { v4 as uuid } from 'uuid';
import { and } from '~/features/database/database.util';
import { selectAccount } from '~/features/accounts/accounts.util';

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
    private accountsCache: AccountsCacheService,
  ) {}

  selectUnique(
    address: UAddress = getUserCtx().accounts[0]?.address,
    shape?: ShapeFunc<typeof e.Account>,
  ) {
    if (!address) return null;

    return this.db.queryWith(
      { address: e.UAddress },
      ({ address }) =>
        e.select(e.Account, (a) => ({
          filter_single: { address },
          ...shape?.(a),
        })),
      { address },
    );
  }

  select({ chain }: AccountsInput, shape?: ShapeFunc<typeof e.Account>) {
    return this.db.queryWith(
      { chain: e.optional(e.str) },
      ({ chain }) =>
        e.select(e.Account, (a) => ({
          ...shape?.(a),
          filter: e.op(e.op(a.chain, '=', chain), '??', true),
        })),
      { chain },
    );
  }

  private labelPattern = /^[0-9a-zA-Z$-]{4,40}$/;
  async labelAvailable(label: string): Promise<boolean> {
    if (!this.labelPattern.exec(label)) return false;

    return e
      .params({ label: e.str }, ({ label }) => {
        const account = e.select(e.Account, () => ({ filter_single: { label } }));
        return e.select(e.op('not', e.op('exists', account)));
      })
      .run(this.db.DANGEROUS_superuserClient, { label });
  }

  async createAccount({ chain, label, policies: policyInputs }: CreateAccountInput) {
    const network = this.networks.get(chain);
    const approver = getApprover();

    if (!policyInputs.find((p) => p.approvers.includes(approver)))
      throw new UserInputError('User must be included in at least one policy');

    const implementation = ACCOUNT_IMPLEMENTATION.address[chain];
    const salt = randomDeploySalt();
    const policies = policyInputs.map((p, i) => inputAsPolicy(asPolicyKey(i), p));

    const account = await getProxyAddress({
      network,
      deployer: DEPLOYER.address[chain],
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
          implementation,
          salt,
        })
        .run(db);

      for (const [i, policy] of policyInputs.entries()) {
        await this.policies.create({
          ...policy,
          account,
          key: asPolicyKey(i),
          initState: true,
        });
      }
    });

    this.contracts.addAccountAsVerified(asAddress(account));
    this.faucet.requestTokens(account);
    this.publishAccount({ account, event: AccountEvent.create });
    this.setAsPrimaryAccountIfNotConfigured(id);

    return { id, address: account };
  }

  async updateAccount({ account: address, label, photo }: UpdateAccountInput) {
    const r = await this.db.query(
      e.update(e.Account, () => ({
        set: { label, photo },
        filter_single: { address },
      })),
    );

    if (!r) throw new UserInputError(`Must be a member of the account to update it`);

    this.publishAccount({ account: address, event: AccountEvent.update });
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
