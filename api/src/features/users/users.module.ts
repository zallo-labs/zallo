import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  exports: [UsersService],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
