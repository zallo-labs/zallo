import { Query, Resolver } from '@nestjs/graphql';
import { PaymastersService } from './paymasters.service';
import { FeesPerGas } from './paymasters.model';
import { Input } from '~/common/decorators/input.decorator';
import { EstimateFeesPerGasInput } from './paymasters.input';

@Resolver()
export class PaymastersResolver {
  constructor(private service: PaymastersService) {}

  @Query(() => FeesPerGas, { nullable: true })
  estimateFeesPerGas(@Input() { feeToken }: EstimateFeesPerGasInput): Promise<FeesPerGas | null> {
    return this.service.estimateFeePerGas(feeToken);
  }
}
