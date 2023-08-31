import { Injectable, OnModuleInit } from '@nestjs/common';
import e, { createClient, $infer } from '~/edgeql-js';
import { Expression } from '~/edgeql-js/typesystem';
import { getRequestContext } from '~/request/ctx';
import { AsyncLocalStorage } from 'async_hooks';
import type { Client } from 'edgedb';
import { Transaction } from 'edgedb/dist/transaction';

type Hook = () => void;
type Globals = Partial<Record<keyof typeof e.global, any>>;

interface Context {
  transaction: Transaction;
  afterTransactionHooks: Hook[];
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  protected __client: Client;
  protected context = new AsyncLocalStorage<Context>();

  constructor() {
    this.__client = createClient()
      .withConfig({ allow_user_specified_id: true })
      .withRetryOptions({ attempts: 5 });
  }

  async onModuleInit() {
    await this.__client.ensureConnected();
  }

  get DANGEROUS_superuserClient() {
    return this.__client.withConfig({ apply_access_policies: false });
  }

  get client() {
    const user = getRequestContext()?.user;

    return user
      ? this.__client.withGlobals({
          current_approver_address: user.approver,
          current_account_ids_array: user.accounts.map((a) => a.id),
        } satisfies Globals)
      : this.DANGEROUS_superuserClient;
  }

  async query<Expr extends Expression>(expression: Expr): Promise<$infer<Expr>> {
    return expression.run(this.client);
  }

  async transaction<T>(action: (transaction: Transaction) => Promise<T>): Promise<T> {
    const transaction = this.context.getStore()?.transaction;
    if (transaction) {
      return action(transaction);
    }

    const afterTransactionHooks: Hook[] = [];

    const result = await this.client.transaction((transaction) =>
      this.context.run({ transaction, afterTransactionHooks }, () => action(transaction)),
    );

    afterTransactionHooks.forEach((f) => f());

    return result;
  }

  afterTransaction(hook: Hook) {
    const store = this.context.getStore();
    if (store) {
      store.afterTransactionHooks.push(hook);
    } else {
      hook();
    }
  }
}
