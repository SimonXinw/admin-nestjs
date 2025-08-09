import { Global, Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { buildRedisOptions } from './redis.config';

@Global()
@Module({
  imports: [RedisModule.forRoot(buildRedisOptions())],
  exports: [RedisModule],
})
export class RedisGlobalModule {}


