import { Test, TestingModule } from '@nestjs/testing';
import { GroupApproverResolver } from './group-approver.resolver';

describe('GroupApproverResolver', () => {
  let resolver: GroupApproverResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupApproverResolver],
    }).compile();

    resolver = module.get<GroupApproverResolver>(GroupApproverResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
