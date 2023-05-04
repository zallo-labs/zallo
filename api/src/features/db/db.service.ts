import { $infer } from '@db/edgeql-js';
import { Injectable } from '@nestjs/common';
import { Client, createClient } from 'edgedb';
import { Expression } from '@db/edgeql-js/typesystem';

@Injectable()
export class DbService {
  private client: Client;

  constructor() {
    this.client = createClient();
  }

  async onModuleInit() {
    await this.client.ensureConnected();
  }

  async query<Expr extends Expression>(expression: Expr): Promise<$infer<Expr>> {
    return await expression.run(this.client);
  }
}
