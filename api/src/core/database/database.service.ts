import '~/util/patches'; // Required due to jest BigInt serialization error
import { Injectable, OnModuleInit } from '@nestjs/common';
import e, { createClient, $infer } from '~/edgeql-js';
import { BaseTypeToTsType, Expression, ParamType } from '~/edgeql-js/typesystem';
import { getContextUnsafe } from '~/core/context';
import { AsyncLocalStorage } from 'async_hooks';
import { EdgeDBError, Executor, type Client } from 'edgedb';
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
      .withRetryOptions({ attempts: 10 });
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

    return this.__client.withGlobals({
      current_accounts: reqCtx.user.accounts.map((a) => a.id),
      current_approver_address: reqCtx.user.approver,
      // current_user_id: reqCtx.user.id,
    } satisfies Globals);
  }

  private async run<R>(f: () => Promise<R>, name = 'inline'): Promise<R> {
    return Sentry.startSpan({ op: 'db.query', name }, async () => {
      try {
        return await f();
      } catch (e) {
        if (e instanceof EdgeDBError && e['_query']) Sentry.setExtra('EdgeQL', e['_query']);
        throw e;
      }
    });
  }

  async query<Expr extends Expression>(expression: Expr): Promise<$infer<Expr>> {
    return this.run(() => expression.run(this.client));
  }

  async queryWith<
    Params extends { [key: string]: ParamType | $expr_OptionalParam },
    Expr extends Expression,
  >(
    paramsDef: Params,
    getExpr: (params: paramsToParamExprs<Params>) => Expr,
    params: paramsToParamArgs<Params>,
  ) {
    try {
      const expression = e.params(paramsDef, getExpr as any);
      return (await this.run(() => expression.run(this.client, params as any))) as Promise<
        $infer<Expr>
      >;
    } catch (e) {
      if (e instanceof EdgeDBError) Sentry.setExtra('EdgeQL Params', params);
      throw e;
    }
  }

  async queryWith2<
    Params extends { [key: string]: ParamType | $expr_OptionalParam },
    Expr extends Expression,
  >(
    paramsDef: Params,
    params: paramsToParamArgs<Params>,
    getExpr: (params: paramsToParamExprs<Params>) => Expr,
  ) {
    return this.queryWith(paramsDef, getExpr, params);
  }

  async exec<F extends (client: Executor, args: any) => Promise<any>>(
    f: F,
    args: Parameters<F>[1],
  ): Promise<Awaited<ReturnType<F>>> {
    return this.run(() => f(this.client, args), f.name);
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
