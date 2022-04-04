import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { CONFIG } from "config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(CONFIG.api.port);

  Logger.log(`${await app.getUrl()}/graphql`);
}
bootstrap();
