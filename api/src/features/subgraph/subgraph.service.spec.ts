import { Test, TestingModule } from '@nestjs/testing';
import { SubgraphService } from './subgraph.service';
import { createMock } from '@golevelup/ts-jest';

describe(SubgraphService.name, () => {
  let service: SubgraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubgraphService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<SubgraphService>(SubgraphService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
