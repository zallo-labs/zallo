import { Field } from '@nestjs/graphql';
import { TransactionProposal } from '../transaction-proposals/transaction-proposals.model';
import { PaymasterFees } from '../paymasters/paymasters.model';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Receipt } from '../receipts/receipts.model';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { Node, NodeType } from '~/decorators/interface.decorator';

@NodeType()
export class Transaction extends Node {
  @Bytes32Field()
  hash: string; // Hex

  @Field(() => TransactionProposal)
  proposal: TransactionProposal;

  @DecimalField()
  maxEthFeePerGas: Decimal;

  @Field(() => PaymasterFees)
  paymasterEthFees: PaymasterFees;

  // @DecimalField()
  // ethDiscount: Decimal;

  @DecimalField()
  ethCreditUsed: Decimal;

  @DecimalField()
  ethPerFeeToken: Decimal;

  @DecimalField()
  usdPerFeeToken: Decimal;

  @DecimalField()
  maxNetworkEthFee: Decimal;

  @DecimalField()
  maxEthFees: Decimal;

  @Field(() => Date)
  submittedAt: Date;

  @Field(() => Boolean)
  cancelled: boolean;

  @Field(() => Date, { nullable: true })
  scheduledFor?: Date;

  @Field(() => Receipt, { nullable: true })
  receipt?: Receipt | null;
}
