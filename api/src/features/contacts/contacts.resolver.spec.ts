import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactsResolver } from './contacts.resolver';

describe('ContactsResolver', () => {
  let resolver: ContactsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsResolver],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get<ContactsResolver>(ContactsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
