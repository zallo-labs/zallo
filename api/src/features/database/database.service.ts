import '~/util/patches'; // Required due to jest BigInt serialization error
import { Injectable, OnModuleInit } from '@nestjs/common';
import e, { createClient, $infer } from '~/edgeql-js';
import { BaseTypeToTsType, Expression, ParamType } from '~/edgeql-js/typesystem';
import { getRequestContext } from '~/request/ctx';
import { AsyncLocalStorage } from 'async_hooks';
import { EdgeDBError, type Client } from 'edgedb';
import { Transaction } from 'edgedb/dist/transaction';
import { MaybePromise } from 'lib';
import * as Sentry from '@sentry/node';
import { $expr_OptionalParam, $expr_Param } from '~/edgeql-js/params';

type Hook = () => MaybePromise<void>;
type Globals = Partial<Record<keyof typeof e.global, unknown>>;

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
    this.__client = createClient()
      .withConfig({
        allow_user_specified_id: true /* Required for account insertion */,
      })
      .withRetryOptions({ attempts: 5 });
    this.DANGEROUS_superuserClient = this.__client.withConfig({ apply_access_policies: false });
  }

  async onModuleInit() {
    await this.__client.ensureConnected();
  }

  get client() {
    return this.context.getStore()?.transaction ?? this._client;
  }

  protected get _client() {
    const ctx = getRequestContext()?.user;
    if (!ctx) return this.DANGEROUS_superuserClient;

    return this.__client.withGlobals({
      current_approver_address: ctx.approver,
      current_accounts_array: ctx.accounts.map((a) => a.id),
    } satisfies Globals);
  }

  private async run<R>(p: Promise<R>): Promise<R> {
    try {
      return await p;
    } catch (e) {
      if (e instanceof EdgeDBError && e['_query']) Sentry.setExtra('EdgeQL', e['_query']);
      throw e;
    }
  }

  async query<Expr extends Expression>(expression: Expr): Promise<$infer<Expr>> {
    return this.run(expression.run(this.client));
  }

  async queryWith<
    Params extends { [key: string]: ParamType | $expr_OptionalParam },
    Expr extends Expression,
  >(
    paramsDef: Params,
    getExpr: (params: paramsToParamExprs<Params>) => Expr,
    params: paramsToParamArgs<Params>,
  ) {
    const expression = e.params(paramsDef, getExpr as any);
    return this.run(expression.run(this.client, params as any)) as Promise<$infer<Expr>>;
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

type paramsToParamArgs<
  Params extends {
    [key: string]: ParamType | $expr_OptionalParam;
  },
> = {
  [key in keyof Params as Params[key] extends ParamType
    ? key
    : never]: Params[key] extends ParamType ? Readonly<BaseTypeToTsType<Params[key], true>> : never;
} & {
  [key in keyof Params as Params[key] extends $expr_OptionalParam
    ? key
    : never]?: Params[key] extends $expr_OptionalParam
    ? Readonly<BaseTypeToTsType<Params[key]['__type__'], true> | null>
    : never;
};

type paramsToParamExprs<
  Params extends {
    [key: string]: ParamType | $expr_OptionalParam;
  },
> = {
  [key in keyof Params]: Params[key] extends $expr_OptionalParam
    ? $expr_Param<key, Params[key]['__type__'], true>
    : Params[key] extends ParamType
      ? $expr_Param<key, Params[key], false>
      : never;
};
