import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { QuorumsResolver } from './quorums.resolver';

describe(QuorumsResolver.name, () => {
  let resolver: QuorumsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuorumsResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get(QuorumsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
