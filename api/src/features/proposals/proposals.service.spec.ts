import { Test } from '@nestjs/testing';
import { ProposalsService } from './proposals.service';
import { createMock } from '@golevelup/ts-jest';
import { PRISMA_MOCK_PROVIDER } from '../util/prisma/prisma.service.mock';
import { PrismaService } from '../util/prisma/prisma.service';

describe(ProposalsService.name, () => {
  let service: ProposalsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProposalsService, PRISMA_MOCK_PROVIDER],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(ProposalsService);
    prisma = module.get(PrismaService);
  });

  describe('approve', () => {
    it.todo('creates approval');

    it.todo("throws if the proposal doesn't exist");

    it.todo("throws if the user doesn't belong to the proposing quorum");
  });

  describe('reject', () => {
    it.todo('creates rejection');

    it.todo('creates rejection to proposal when the user had previously approved');

    it.todo("throws if the proposal doesn't exist");

    it.todo("throws if the user doesn't belong to the proposing quorum");
  });
});
