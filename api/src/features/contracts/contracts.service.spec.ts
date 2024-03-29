import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { createMock } from '@golevelup/ts-jest';

describe(ContractsService.name, () => {
  let service: ContractsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractsService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<ContractsService>(ContractsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
