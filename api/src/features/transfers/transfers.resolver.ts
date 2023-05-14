import { Info, Query, Resolver } from '@nestjs/graphql';
import { TransfersService } from './transfers.service';
import { TransfersInput } from './transfers.input';
import { Transfer } from './transfers.model';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../database/database.select';
import { Input } from '~/decorators/input.decorator';

@Resolver(() => Transfer)
export class TransfersResolver {
  constructor(private service: TransfersService) {}

  @Query(() => [Transfer])
  async transfers(
    @Input({ defaultValue: {} }) input: TransfersInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.transfers(input, getShape(info));
  }
}
