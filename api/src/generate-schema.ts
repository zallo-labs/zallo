import type {} from './request/request';

import { writeFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { printSchema } from 'graphql';

import { AccountsResolver } from './features/accounts/accounts.resolver';
import { ContactsResolver } from './features/contacts/contacts.resolver';
import { ContractFunctionsResolver } from './features/contract-functions/contract-functions.resolver';
import { ContractsResolver } from './features/contracts/contracts.resolver';
import { FaucetResolver } from './features/faucet/faucet.resolver';
import { MessageProposalsResolver } from './features/message-proposals/message-proposals.resolver';
import { PoliciesResolver } from './features/policies/policies.resolver';
import { TransactionProposalsResolver } from './features/transaction-proposals/transaction-proposals.resolver';
import { TransfersResolver } from './features/transfers/transfers.resolver';
import { UsersResolver } from './features/users/users.resolver';

const resolvers = [
  AccountsResolver,
  ContactsResolver,
  ContractFunctionsResolver,
  ContractsResolver,
  FaucetResolver,
  MessageProposalsResolver,
  PoliciesResolver,
  TransactionProposalsResolver,
  TransfersResolver,
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
