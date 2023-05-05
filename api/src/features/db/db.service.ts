import { $infer } from '@db/edgeql-js';
import { Injectable } from '@nestjs/common';
import { Client, createClient } from 'edgedb';
import { Expression } from '@db/edgeql-js/typesystem';
import { getRequestContext } from '~/request/ctx';

@Injectable()
export class DbService {
  private __client: Client;

  constructor() {
    this.__client = createClient();
  }

  async onModuleInit() {
    await this.__client.ensureConnected();
  }

  async query<Expr extends Expression>(expression: Expr): Promise<$infer<Expr>> {
    return await expression.run(this.client);
  }

  get client(): Client {
    const user = getRequestContext()?.user;

    return user
      ? this.__client.withGlobals({
          // current_user_id: user.address,
          current_user_address: user.address,
          current_user_accounts_array: [...user.accounts],
        })
      : this.__client.withConfig({
          apply_access_policies: false,
        });
  }
}
