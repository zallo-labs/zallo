import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { CONFIG } from "lib";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(CONFIG.apiPort);

  Logger.log(`${await app.getUrl()}/graphql`);
}
bootstrap();
