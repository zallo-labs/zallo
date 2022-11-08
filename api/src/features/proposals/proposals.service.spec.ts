import { Test, TestingModule } from '@nestjs/testing';
import { ProposalsService } from './proposals.service';
import { createMock } from '@golevelup/ts-jest';

describe(ProposalsService.name, () => {
  let service: ProposalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProposalsService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<ProposalsService>(ProposalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
