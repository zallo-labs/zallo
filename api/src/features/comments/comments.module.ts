import { Module } from '@nestjs/common';
import { CommentsResolver } from './comments.resolver';

@Module({
  providers: [CommentsResolver]
})
export class CommentsModule {}
