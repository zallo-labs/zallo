import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { DevicesResolver } from './devices.resolver';

describe(DevicesResolver.name, () => {
  let resolver: DevicesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevicesResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get<DevicesResolver>(DevicesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
