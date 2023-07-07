import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  name?: string;
}

@InputType()
export class PairInput {
  @Field(() => String)
  token: string;
}
