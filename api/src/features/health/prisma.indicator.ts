import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../util/prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string) {
    try {
      await this.prisma.asSuperuser.$executeRaw`SELECT 1;`;
      return this.getStatus(key, true, { status: 'up' });
    } catch (e) {
      throw new HealthCheckError('Prisma check failed', e);
    }
  }
}
