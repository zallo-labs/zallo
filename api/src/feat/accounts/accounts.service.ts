import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/core/database';
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
  asUAddress,
} from 'lib';
import { ShapeFunc } from '~/core/database';
import {
  AccountEvent,
  AccountsInput,
  CreateAccountInput,
  UpdateAccountInput,
} from './accounts.input';
import { getApprover, getUserCtx } from '~/core/context';
import { UserInputError } from '@nestjs/apollo';
import { PubsubService } from '~/core/pubsub/pubsub.service';
import { ContractsService } from '../contracts/contracts.service';
import { FaucetService } from '../faucet/faucet.service';
import { MIN_AUTO_POLICY_KEY, PoliciesService } from '../policies/policies.service';
import { inputAsPolicy } from '../policies/policies.util';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { v4 as uuid } from 'uuid';
import { and } from '~/core/database';
import { selectAccount } from '~/feat/accounts/accounts.util';

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

  private namePattern = /^(?![0O][xX])[^\n]{3,50}$/;
  async nameAvailable(name: string): Promise<boolean> {
    if (!this.namePattern.exec(name)) return false;

    return e
      .params({ name: e.str }, ({ name }) => {
        const labels = e.select(e.GlobalLabel, (l) => ({ filter: e.op(l.name, '=', name) }));
        return e.select(e.op('not', e.op('exists', labels)));
      })
      .run(this.db.DANGEROUS_superuserClient, { name });
  }

  async createAccount({ chain, name, policies: policyInputs }: CreateAccountInput) {
    const baseAutoKey = Math.max(MIN_AUTO_POLICY_KEY, ...policyInputs.map((p) => p.key ?? 0));
    const policies = policyInputs.map((p, i) => ({
      ...p,
      key: p.key ?? asPolicyKey(i + baseAutoKey),
    }));
    if (new Set(policies.map((p) => p.key)).size !== policies.length)
      throw new UserInputError('Duplicate policy keys');

    const implementation = ACCOUNT_IMPLEMENTATION.address[chain];
    const salt = randomDeploySalt();
    const account = asUAddress(
      getProxyAddress({
        deployer: DEPLOYER.address[chain],
        implementation,
        salt,
        policies: policies.map((p) => inputAsPolicy(p.key, p)),
      }),
      chain,
    );

    // The account id must be in the user's list of accounts prior to starting the transaction for the globals to be set correctly
    const id = uuid();
    await this.accountsCache.addCachedAccount({
      approver: getApprover(),
      account: { id, address: account },
    });

    await this.db.transaction(async () => {
      await this.db.query(
        e.insert(e.Account, {
          id,
          address: account,
          name,
          implementation,
          salt,
        }),
      );

      for (const policy of policyInputs) {
        await this.policies.create({
          account,
          initState: true,
          ...policy,
        });
      }
    });

    this.contracts.addAccountAsVerified(asAddress(account));
    this.faucet.requestTokens(account);
    this.publishAccount({ account, event: AccountEvent.create });
    this.setAsPrimaryAccountIfNotConfigured(id);

    return { id, address: account };
  }

  async updateAccount({ account: address, name, photo }: UpdateAccountInput) {
    const r = await this.db.query(
      e.update(e.Account, () => ({
        set: { name, photo },
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
        approvers: { address: true },
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
