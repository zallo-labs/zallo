import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe(UsersResolver.name, () => {
  let resolver: DeepMocked<UsersResolver>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
