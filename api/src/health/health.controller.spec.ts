import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HealthCheckService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let health: DeepMocked<HealthCheckService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    })
      .useMocker(createMock)
      .compile();

    controller = module.get<HealthController>(HealthController);
    health = module.get(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Check should succeed', async () => {
    health.check.mockReturnValue(
      (async () => ({
        status: 'ok',
        details: {},
      }))(),
    );

    expect((await controller.check()).status).toEqual('ok');
  });
});
