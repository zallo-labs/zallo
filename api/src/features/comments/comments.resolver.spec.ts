import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsResolver } from './comments.resolver';

describe('CommentsResolver', () => {
  let resolver: CommentsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentsResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get<CommentsResolver>(CommentsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
