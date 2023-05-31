import { Parent, Resolver } from '@nestjs/graphql';
import { Receipt } from './receipts.model';
import { ReceiptsService } from './receipts.service';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';

@Resolver(() => Receipt)
export class ReceiptsResolver {
  constructor(private service: ReceiptsService) {}

  @ComputedField<typeof e.Receipt>(
    () => String,
    { success: true, response: true },
    { nullable: true },
  )
  decodedResponse(@Parent() { success, response }: Receipt): string | undefined {
    return this.service.decodeResponse(success, response);
  }
}
