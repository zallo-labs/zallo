import { Injectable, OnModuleInit } from '@nestjs/common';
import e, { createClient, $infer } from '~/edgeql-js';
import { Expression } from '~/edgeql-js/typesystem';
import { getRequestContext } from '~/request/ctx';
import { AsyncLocalStorage } from 'async_hooks';
import { type Client } from 'edgedb';
import { Transaction } from 'edgedb/dist/transaction';
import { MaybePromise } from 'lib';

type Hook = () => MaybePromise<void>;
type Globals = Partial<Record<keyof typeof e.global, any>>;

interface Context {
  transaction: Transaction;
  afterTransactionHooks: Hook[];
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  protected __client: Client;
  protected context = new AsyncLocalStorage<Context>();
  readonly DANGEROUS_superuserClient: Client;

  constructor() {
    this.__client = createClient().withConfig({
      allow_user_specified_id: true /* Required for account insertion */,
    });
    this.DANGEROUS_superuserClient = this.__client.withConfig({ apply_access_policies: false });
  }

  async onModuleInit() {
    await this.__client.ensureConnected();
  }

  get client() {
    const transaction = this.context.getStore()?.transaction;
    if (transaction) return transaction;

    return this._client;
  }

  private get _client() {
    const ctx = getRequestContext()?.user;
    if (!ctx) return this.DANGEROUS_superuserClient;

    return this.__client.withGlobals({
      current_approver_address: ctx.approver,
      current_accounts_array: ctx.accounts.map((a) => a.id),
    } satisfies Globals);
  }

  async query<Expr extends Expression>(expression: Expr): Promise<$infer<Expr>> {
    return expression.run(this.client);
  }

  async transaction<T>(action: (transaction: Transaction) => Promise<T>): Promise<T> {
    const transaction = this.context.getStore()?.transaction;
    if (transaction) return action(transaction);

    const afterTransactionHooks: Hook[] = [];

    const result = await this._client.transaction((transaction) =>
      this.context.run({ transaction, afterTransactionHooks }, () => action(transaction)),
    );

    this.processHooks(afterTransactionHooks);

    return result;
  }

  async afterTransaction(hook: Hook) {
    const store = this.context.getStore();
    if (store) {
      store.afterTransactionHooks.push(hook);
    } else {
      await hook();
    }
  }

  async processHooks(hooks: Hook[]) {
    // Executed serially
    for (const hook of hooks) {
      await hook();
    }
  }
}
