import { ArgsType } from '@nestjs/graphql';
import { UUID } from 'lib';
import { IdField } from '~/common/scalars/Id.scalar';

@ArgsType()
export class NodeArgs {
  @IdField()
  id: UUID;
}
