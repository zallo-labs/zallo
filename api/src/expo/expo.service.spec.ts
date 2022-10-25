import { Test, TestingModule } from '@nestjs/testing';
import { ExpoService } from './expo.service';

describe(ExpoService.name, () => {
  let service: ExpoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpoService],
    }).compile();

    service = module.get<ExpoService>(ExpoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
