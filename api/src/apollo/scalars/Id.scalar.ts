import { Field, ID } from '@nestjs/graphql';

export const IdField = () => Field(() => ID);
