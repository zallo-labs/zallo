import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { PrismaModule } from "nestjs-prisma";
import { HealthController } from "./health.controller";
import { PrismaHealthIndicator } from "./prismaHealth.indicator";

@Module({
  imports: [TerminusModule, HttpModule, PrismaModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator]
})
export class HealthModule {}
