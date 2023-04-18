import { Test, TestingModule } from '@nestjs/testing';
import { TransfersService } from './transfers.service';
import { createMock } from '@golevelup/ts-jest';

describe(TransfersService.name, () => {
  let service: TransfersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransfersService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<TransfersService>(TransfersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
