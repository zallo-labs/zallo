import type {} from './common/request';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { writeFileSync } from 'fs';
import { printSchema } from 'graphql';
import { join } from 'path';
import { AccountsResolver } from './feat/accounts/accounts.resolver';
import { ContactsResolver } from './feat/contacts/contacts.resolver';
import { ContractFunctionsResolver } from './feat/contract-functions/contract-functions.resolver';
import { ContractsResolver } from './feat/contracts/contracts.resolver';
import { FaucetResolver } from './feat/faucet/faucet.resolver';
import { PoliciesResolver } from './feat/policies/policies.resolver';
import { TransactionsResolver } from './feat/transactions/transactions.resolver';
import { TransfersResolver } from './feat/transfers/transfers.resolver';
import { UsersResolver } from './feat/users/users.resolver';
import { MessagesResolver } from './feat/messages/messages.resolver';

const resolvers = [
  AccountsResolver,
  ContactsResolver,
  ContractFunctionsResolver,
  ContractsResolver,
  FaucetResolver,
  MessagesResolver,
  PoliciesResolver,
  TransactionsResolver,
  TransfersResolver,
  UsersResolver,
];

const main = async () => {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create(resolvers);

  writeFileSync(join(process.cwd(), '/schema.graphql'), printSchema(schema));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
