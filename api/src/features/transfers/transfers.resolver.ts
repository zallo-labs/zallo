import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { TransfersService } from './transfers.service';
import { TransfersInput } from './transfers.args';
import { Transfer } from './transfers.model';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../database/database.select';

@Resolver(() => Transfer)
export class TransfersResolver {
  constructor(private service: TransfersService) {}

  @Query(() => [Transfer])
  async transfers(@Args('input') input: TransfersInput, @Info() info: GraphQLResolveInfo) {
    return this.service.transfers(input, getShape(info));
  }
}
