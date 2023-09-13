import { Field, InputType } from '@nestjs/graphql';
import { GraphQLURL } from 'graphql-scalars';

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => GraphQLURL, { nullable: true })
  photoUri?: URL;
}

@InputType()
export class LinkInput {
  @Field(() => String)
  token: string;
}
