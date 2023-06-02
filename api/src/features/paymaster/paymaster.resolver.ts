import { Query, Resolver } from '@nestjs/graphql';
import { AddressScalar } from '~/apollo/scalars/Address.scalar';
import { PaymasterService } from './paymaster.service';

@Resolver()
export class PaymasterResolver {
  constructor(private service: PaymasterService) {}

  @Query(() => AddressScalar)
  async paymaster() {
    return this.service.getPaymaster();
  }
}
