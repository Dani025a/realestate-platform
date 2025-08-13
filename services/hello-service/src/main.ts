import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from '@app/common-config';
import { logger } from '@app/common-logging';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(env.PORT);
  logger.info({ port: env.PORT }, 'hello-service up');
}
bootstrap();
