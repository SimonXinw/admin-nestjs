import { Global, Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { buildRedisOptions } from '../../config/redis.config';

/**
 * Redis 全局模块
 * 
 * 提供应用程序级别的 Redis 连接，使用 @Global() 装饰器
 * 使得所有模块都可以直接注入 Redis 服务而无需重复导入
 */
@Global()
@Module({
  imports: [RedisModule.forRoot(buildRedisOptions())],
  exports: [RedisModule],
})
export class RedisGlobalModule {}
