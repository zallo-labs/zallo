import { ArgsType } from '@nestjs/graphql';
import { UniqueCommentArgs } from '../comments/comments.args';

@ArgsType()
export class ReactToCommentArgs extends UniqueCommentArgs {
  emojis: string[];
}
