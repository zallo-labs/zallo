import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetAddrNameArgs {
  @Field(() => String, { nullable: false })
  addr!: string;
}
