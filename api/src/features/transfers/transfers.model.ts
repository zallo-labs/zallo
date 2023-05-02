import { Field, registerEnumType } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { GraphQLDecimal } from 'prisma-graphql-type-decimal';
import { Decimal } from '@prisma/client/runtime/library';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Account } from '../accounts/accounts.model';
import { TransactionReceipt } from '../transactions/transactions.model';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { TransferDirection } from '@gen/prisma/transfer-direction.enum';

@ObjectType()
export class Transfer {
  id: number;

  @Field(() => Account, { nullable: false })
  account?: Account;

  @AddressField()
  accountId: string; // Address

  @AddressField()
  token: string; // Address

  @AddressField()
  from: string; // Address

  @AddressField()
  to: string; // Address

  @Field(() => GraphQLDecimal, { nullable: false })
  amount: Decimal;

  direction: TransferDirection;

  blockNumber: number;

  timestamp: Date;

  receipt?: TransactionReceipt | null;

  @Bytes32Field()
  transactionHash: string | null; // Hex | null
}

// export enum TransferDirection {
//   IN = 'IN',
//   OUT = 'OUT',
// }
// registerEnumType(TransferDirection, { name: 'TransferDirection' });
