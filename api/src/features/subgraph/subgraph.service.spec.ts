import { Test, TestingModule } from '@nestjs/testing';
import { SubgraphService } from './subgraph.service';

describe(SubgraphService.name, () => {
  let service: SubgraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubgraphService],
    }).compile();

    service = module.get<SubgraphService>(SubgraphService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
