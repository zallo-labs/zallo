import { Field } from '@nestjs/graphql';
import { Transaction } from '../transactions/transactions.model';
import { PaymasterFees } from '../paymasters/paymasters.model';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Result } from './results.model';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { Node, NodeType } from '~/decorators/interface.decorator';
import { Hex } from 'lib';

@NodeType()
export class SystemTx extends Node {
  @Bytes32Field()
  hash: Hex;

  @Field(() => Transaction)
  proposal: Transaction;

  @DecimalField()
  maxEthFeePerGas: Decimal;

  @Field(() => PaymasterFees)
  paymasterEthFees: PaymasterFees;

  @DecimalField()
  ethCreditUsed: Decimal;

  // @DecimalField()
  // ethDiscount: Decimal;

  @DecimalField()
  ethPerFeeToken: Decimal;

  @DecimalField()
  usdPerFeeToken: Decimal;

  @DecimalField()
  maxNetworkEthFee: Decimal;

  @DecimalField()
  maxEthFees: Decimal;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => Result, { nullable: true })
  result?: Result | null;
}
