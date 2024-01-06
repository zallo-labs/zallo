import { InputType } from '@nestjs/graphql';

import { Hex } from 'lib';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';

@InputType()
export class TransactionInput {
  @Bytes32Field()
  hash: Hex;
}

@InputType()
export class ExecuteInput {
  @Bytes32Field()
  proposalHash: Hex;
}
