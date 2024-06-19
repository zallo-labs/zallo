import '~/util/patches'; // Required due to jest BigInt serialization error
import { Injectable, OnModuleInit } from '@nestjs/common';
import e, { createClient, $infer } from '~/edgeql-js';
import { BaseTypeToTsType, Expression, ParamType } from '~/edgeql-js/typesystem';
import { getContextUnsafe } from '#/util/context';
import { AsyncLocalStorage } from 'async_hooks';
import { EdgeDBError, type Client } from 'edgedb';
import { Transaction } from 'edgedb/dist/transaction';
import * as Sentry from '@sentry/node';
import { $expr_OptionalParam, $expr_Param } from '~/edgeql-js/params';

type Globals = Partial<Record<keyof typeof e.global, unknown>>;

interface DatabaseContext {
  transaction: Transaction;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  protected __client: Client;
  protected context = new AsyncLocalStorage<DatabaseContext>();
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
    const reqCtx = getContextUnsafe();
    if (!reqCtx?.user) return this.DANGEROUS_superuserClient;

    reqCtx.db ??= this.__client.withGlobals({
      current_accounts: reqCtx.user.accounts.map((a) => a.id),
      current_approver_address: reqCtx.user.approver,
      // current_user_id: reqCtx.user.id,
    } satisfies Globals);

    return reqCtx.db;
  }

  private async run<R>(p: Promise<R>): Promise<R> {
    return Sentry.startSpan({ op: 'db.query', name: 'db.query' }, async () => {
      try {
        return await p;
      } catch (e) {
        if (e instanceof EdgeDBError && e['_query']) Sentry.setExtra('EdgeQL', e['_query']);
        throw e;
      }
    });
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

    return await Sentry.startSpan({ op: 'db.transaction', name: 'db.transaction' }, async () => {
      return await this._client.transaction((transaction) =>
        this.context.run({ transaction }, () => action(transaction)),
      );
    });
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
