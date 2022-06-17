import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { ContractMethodsResolver } from './contract-methods.resolver';

describe('ContractMethodsResolver', () => {
  let resolver: ContractMethodsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractMethodsResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get<ContractMethodsResolver>(ContractMethodsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
