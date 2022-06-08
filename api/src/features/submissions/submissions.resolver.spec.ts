import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsResolver } from './submissions.resolver';

describe('SubmissionsResolver', () => {
  let resolver: SubmissionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubmissionsResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get<SubmissionsResolver>(SubmissionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
