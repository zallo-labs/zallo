import { Test, TestingModule } from '@nestjs/testing';
import { ApproversResolver } from './approvers.resolver';

describe('ApproversResolver', () => {
  let resolver: ApproversResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApproversResolver],
    }).compile();

    resolver = module.get<ApproversResolver>(ApproversResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
