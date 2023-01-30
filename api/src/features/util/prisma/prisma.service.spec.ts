import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { MOCK_PRISMA_SERVICE } from './prisma.service.mock';

describe(PrismaService.name, () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(MOCK_PRISMA_SERVICE)
      .compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should be connected', async () => {
    expect(await service.$executeRaw`SELECT 1;`).toEqual(1);
  });
});
