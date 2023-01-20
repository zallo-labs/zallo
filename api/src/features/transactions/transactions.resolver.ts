import { Transaction } from '@gen/transaction/transaction.model';
import { ID, Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver(() => Transaction)
export class TransactionsResolver {
  @ResolveField(() => ID, { description: 'hash' })
  id(@Parent() transaction: Transaction): string {
    return transaction.hash;
  }
}
