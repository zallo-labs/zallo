import { Field } from '@nestjs/graphql';
import { TransactionProposal } from '../transaction-proposals/transaction-proposals.model';
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

  @Field(() => TransactionProposal)
  proposal: TransactionProposal;

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
  submittedAt: Date;

  @Field(() => Result, { nullable: true })
  receipt?: Result | null;
}
