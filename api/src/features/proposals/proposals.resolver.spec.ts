import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { ProposalsResolver } from './proposals.resolver';

describe(ProposalsResolver.name, () => {
  let resolver: ProposalsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProposalsResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get<ProposalsResolver>(ProposalsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
