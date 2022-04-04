import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { SafesResolver } from './safes.resolver';

describe('SafesResolver', () => {
  let resolver: SafesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SafesResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get<SafesResolver>(SafesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
