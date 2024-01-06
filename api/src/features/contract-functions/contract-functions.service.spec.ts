import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { ContractFunctionsService } from './contract-functions.service';

describe(ContractFunctionsService.name, () => {
  let service: ContractFunctionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractFunctionsService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<ContractFunctionsService>(ContractFunctionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
