import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { createMock } from '@golevelup/ts-jest';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
