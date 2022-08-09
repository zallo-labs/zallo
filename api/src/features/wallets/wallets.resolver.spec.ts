import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { WalletsResolver } from './wallets.resolver';

describe(WalletsResolver.name, () => {
  let resolver: WalletsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletsResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get(WalletsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
