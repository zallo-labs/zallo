import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PRISMA_MOCK_PROVIDER } from './prisma.service.mock';

describe(PrismaService.name, () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PRISMA_MOCK_PROVIDER],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should be connected', async () => {
    expect(await service.asSystem.$executeRaw`SELECT 1;`).toEqual(1);
  });
});
