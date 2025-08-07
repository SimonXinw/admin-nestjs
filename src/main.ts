import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { generateSwaggerDocument } from './swaggerDoc';
import { initializeDatabases } from './config/database-init';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    // 在启动应用之前先初始化数据库
    logger.log('🚀 开始初始化数据库...');
    await initializeDatabases();
    logger.log('✅ 数据库初始化完成，继续启动应用...');
  } catch (error) {
    logger.error('❌ 数据库初始化失败，应用启动中止:', error);
    process.exit(1);
  }
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(), // 配置日志
  });

  // 全局校验
  app.useGlobalPipes(new ValidationPipe());

  // 创建 swagger 文档
  generateSwaggerDocument(app);

  // 监听端口
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 应用已启动，监听端口: ${port}`);
}

bootstrap();
