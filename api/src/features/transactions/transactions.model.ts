import { Field } from '@nestjs/graphql';
import Decimal from 'decimal.js';

import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';
import { Receipt } from '../receipts/receipts.model';
import { TransactionProposal } from '../transaction-proposals/transaction-proposals.model';

@NodeType()
export class Transaction extends Node {
  @Bytes32Field()
  hash: string; // Hex

  @Field(() => TransactionProposal)
  proposal: TransactionProposal;

  @DecimalField()
  maxEthFeePerGas: Decimal;

  @DecimalField()
  ethDiscount: Decimal;

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

  @Field(() => Receipt, { nullable: true })
  receipt?: Receipt | null;
}
