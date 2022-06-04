import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { TxsResolver } from './txs.resolver';

describe('TxsResolver', () => {
  let resolver: TxsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TxsResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get<TxsResolver>(TxsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
