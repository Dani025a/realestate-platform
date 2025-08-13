import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { cfg } from "./config";
import { logger } from "@app/common-logging";
import { initDb } from "./db";

async function bootstrap() {
  await initDb();
  const app = await NestFactory.create(AppModule);
  await app.listen(cfg.PORT);
  logger.info({ port: cfg.PORT }, "auth-service up");
}
bootstrap();
