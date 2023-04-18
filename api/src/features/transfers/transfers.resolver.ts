import { Args, Query, Resolver } from '@nestjs/graphql';
import { ExplorerTransfer } from '../explorer/explorer.model';
import { TransfersService } from './transfers.service';
import { TransfersInput } from './transfers.args';

@Resolver()
export class TransfersResolver {
  constructor(private service: TransfersService) {}

  @Query(() => [ExplorerTransfer])
  async transfers(@Args('input') input: TransfersInput): Promise<ExplorerTransfer[]> {
    return this.service.transfers(input);
  }
}
