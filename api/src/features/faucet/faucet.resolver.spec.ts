import { Test, TestingModule } from '@nestjs/testing';
import { FaucetResolver } from './faucet.resolver';
import { createMock } from '@golevelup/ts-jest';

describe('FaucetResolver', () => {
  let resolver: FaucetResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaucetResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get<FaucetResolver>(FaucetResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
