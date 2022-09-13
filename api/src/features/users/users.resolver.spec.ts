import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';

describe(UsersResolver.name, () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersResolver],
    }).compile();

    resolver = module.get(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
