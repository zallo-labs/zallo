import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, $infer } from '~/edgeql-js';
import { Expression } from '~/edgeql-js/typesystem';
import { getRequestContext } from '~/request/ctx';
import { AsyncLocalStorage } from 'async_hooks';
import type { Client } from 'edgedb';
import { Transaction } from 'edgedb/dist/transaction';

interface Context {
  transaction: Transaction;
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
          current_user_accounts_array: user.accounts.map((a) => a.id),
        })
      : this.DANGEROUS_superuserClient;
  }

  transaction<T>(action: (transaction: Transaction) => Promise<T>): Promise<T> {
    const transaction = this.context.getStore()?.transaction;
    if (transaction) return action(transaction);

    return this.client.transaction((transaction) =>
      this.context.run({ transaction }, () => action(transaction)),
    );
  }

  async query<Expr extends Expression>(expression: Expr): Promise<$infer<Expr>> {
    return expression.run(this.client);
  }
}
