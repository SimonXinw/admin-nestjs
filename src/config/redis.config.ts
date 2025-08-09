import type { RedisModuleOptions } from '@nestjs-modules/ioredis';

export function buildRedisOptions(): RedisModuleOptions {
  return {
    type: 'single',
    options: {
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB ?? 0),
      // 避免连接失败时抛出 MaxRetriesPerRequestError
      maxRetriesPerRequest: null,
      // 若 Redis 未启动，延迟到首次使用再尝试连接
      lazyConnect: true,
      // 不频繁重试，减少日志刷屏；返回 null 表示不再重连
      retryStrategy: () => null,
      // 若离线，禁用离线排队，交由应用层回退处理
      enableOfflineQueue: false,
    },
  };
}


