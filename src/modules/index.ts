/**
 * 全局基础设施模块统一导出
 * 
 * 这里集中导出所有的全局模块，方便在 AppModule 中统一导入
 * 包括数据库、Redis、日志等基础设施模块
 */

export { RedisGlobalModule } from './redis/redis.module';
export { DatabaseModule } from './database/database.module';

// 未来可以添加更多全局模块，如：
// export { LoggerModule } from './logger/logger.module';
// export { AuthModule } from './auth/auth.module';
// export { CacheModule } from './cache/cache.module';
