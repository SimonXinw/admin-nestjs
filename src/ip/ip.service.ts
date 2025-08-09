import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import type { Redis } from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ip } from './entities/admin/ip.entity';
import { extractRealIp } from '../common/utils/ip.utils';

@Injectable()
export class IpService implements OnModuleDestroy {
  constructor(
    @InjectRepository(Ip, 'admin')
    private readonly ipRepository: Repository<Ip>,
    @InjectRedis() private readonly redisClient: Redis,
  ) {
    // 启动定时批量保存任务
    this.startBatchSaveTask();

    // 监听 Redis 错误，避免未处理的 error 事件导致进程崩溃
    this.redisClient.on('error', (err) => {
      this.logger.warn(`Redis 客户端错误: ${err?.message ?? err}`);
    });

    // 设置 Redis key 命名空间，避免与其他业务冲突
    const redisKeyPrefix = process.env.REDIS_KEY_PREFIX || 'admin_nestjs';
    this.redisQueueKey = `${redisKeyPrefix}:ip:queue`;
    this.logger.log(`Redis 队列键: ${this.redisQueueKey}`);
  }

  private readonly logger = new Logger(IpService.name);

  // Redis 队列 key（带命名空间前缀，避免与其他业务冲突）
  private readonly redisQueueKey: string;

  // 定时器ID，用于清理定时任务
  private batchSaveTimer: NodeJS.Timeout | null = null;

  // 内存队列，用于缓存待保存的IP记录
  private ipQueue: Array<{
    clientIp: string;
    requestPath: string;

    requestMethod: string;
    userAgent?: string;
    ipType: 'IPv4' | 'IPv6';
    timestamp: Date;
  }> = [];

  // 🚀 更激进的队列配置，最大化单实例性能
  // BATCH_SAVE_INTERVAL（批量保存间隔）设置为500毫秒，数值越小，批量保存越频繁，延迟更低，但数据库压力更大；数值越大，批量保存频率降低，延迟增加，但单次批量量可能更大，数据库压力更平滑。实际性能优劣取决于业务场景和数据库承载能力，一般建议在500-1000ms之间权衡。
  private readonly MAX_QUEUE_SIZE = 5000; // 进一步增加队列大小，从2000到5000
  private readonly BATCH_SAVE_INTERVAL = 5000; // 批量保存间隔（毫秒），500较小，适合高并发低延迟场景
  private readonly MIN_BATCH_SIZE = 100; // 增加最小批量大小，从50到100
  private readonly FORCE_SAVE_THRESHOLD = 4000; // 强制保存阈值，避免队列过满

  // 🔒 添加队列操作锁，防止并发问题
  private isProcessing = false;

  // 统计信息
  private stats = {
    totalProcessed: 0, // 总处理数量
    totalSaved: 0, // 成功保存数量
    totalFailed: 0, // 失败数量
    lastBatchTime: new Date(), // 上次批量保存时间
    lastBatchSize: 0, // 上次批量大小
    averageLatency: 0, // 平均延迟
  };

  /**
   * 获取队列状态和统计信息
   */
  getQueueStatus() {
    return {
      queueLength: this.ipQueue.length,
      maxQueueSize: this.MAX_QUEUE_SIZE,
      batchInterval: this.BATCH_SAVE_INTERVAL,
      minBatchSize: this.MIN_BATCH_SIZE,
      isProcessing: this.isProcessing,
      statistics: {
        ...this.stats,
        queueUsagePercent:
          ((this.ipQueue.length / this.MAX_QUEUE_SIZE) * 100).toFixed(2) + '%',
        memoryUsage: process.memoryUsage(),
      },
    };
  }

  /**
   * 异步保存IP信息（不阻塞调用方）
   */
  saveIpInfoAsync(
    clientIp: string,
    ipType: 'IPv4' | 'IPv6',
    requestPath: string,
    requestMethod: string,
    userAgent: string,
  ) {
    // 使用 setImmediate 异步执行，不阻塞当前请求
    setImmediate(async () => {
      try {
        await this.saveIpInfo(
          clientIp,
          ipType,
          requestPath,
          requestMethod,
          userAgent,
        );
      } catch (error) {
        this.logger.error('异步保存IP记录失败', error);
      }
    });
  }

  /**
   * 🚀 优化：将IP信息添加到内存队列（推荐的高性能方案）
   */
  addToQueue(
    ip: string,
    ipType: 'IPv4' | 'IPv6',
    requestPath: string,
    requestMethod: string,
    userAgent?: string,
  ) {
    const ipRecord = {
      clientIp: ip,
      ipType,
      requestPath,
      requestMethod,
      userAgent,
      timestamp: new Date(),
    };

    this.ipQueue.push(ipRecord);
    this.stats.totalProcessed++;

    // 🚀 更激进的触发条件：强制保存阈值 + 原有逻辑
    const shouldForceSave = this.ipQueue.length >= this.FORCE_SAVE_THRESHOLD;
    const shouldTriggerSave =
      shouldForceSave ||
      this.ipQueue.length >= this.MAX_QUEUE_SIZE ||
      (this.ipQueue.length >= this.MIN_BATCH_SIZE &&
        Date.now() - this.stats.lastBatchTime.getTime() > this.BATCH_SAVE_INTERVAL);

    if (shouldTriggerSave && !this.isProcessing) {
      const triggerReason = shouldForceSave ? '强制保存' : '常规触发';
      this.logger.debug(`${triggerReason}批量保存: 队列长度=${this.ipQueue.length}`);
      this.saveBatch();
    }
  }

  /**
   * 🚀 优化：批量保存队列中的IP记录
   */
  private async saveBatch() {
    if (this.ipQueue.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    const startTime = Date.now();
    const batchToSave = [...this.ipQueue];
    this.ipQueue = []; // 清空队列

    try {
      // 🚀 使用 insertOrIgnore 提升性能，避免重复插入错误
      await this.ipRepository
        .createQueryBuilder()
        .insert()
        .into(Ip)
        .values(batchToSave)
        .orIgnore() // MySQL: INSERT IGNORE，提升性能
        .execute();

      // 更新统计信息
      const latency = Date.now() - startTime;
      this.stats.totalSaved += batchToSave.length;
      this.stats.lastBatchTime = new Date();
      this.stats.lastBatchSize = batchToSave.length;
      this.stats.averageLatency = (this.stats.averageLatency + latency) / 2;

      this.logger.log(`✅ 批量保存 ${batchToSave.length} 条IP记录成功，耗时: ${latency}ms`);
    } catch (error) {
      // 更新失败统计
      this.stats.totalFailed += batchToSave.length;

      this.logger.error(
        `❌ 批量保存IP记录失败，丢失 ${batchToSave.length} 条记录`,
        error,
      );

      // 🚀 优化错误处理：根据错误类型决定是否重新入队
      if (this.shouldRetryBatch(error)) {
        const reinsertCount = Math.min(
          batchToSave.length,
          this.MAX_QUEUE_SIZE - this.ipQueue.length,
        );
        if (reinsertCount > 0) {
          this.ipQueue.unshift(...batchToSave.slice(0, reinsertCount));
          this.logger.warn(`重新入队 ${reinsertCount} 条记录`);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 🚀 新增：判断是否应该重试批量保存
   */
  private shouldRetryBatch(error: any): boolean {
    // 只对网络和连接问题重试，避免数据格式错误无限重试
    const retryableErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EPIPE'];
    return retryableErrors.some(errorCode =>
      error.code === errorCode || error.message?.includes(errorCode)
    );
  }

  /**
   * 启动定时批量保存任务
   */
  private startBatchSaveTask() {
    this.batchSaveTimer = setInterval(() => {
      // 只有当队列有数据且不在处理中时才执行
      if (this.ipQueue.length > 0 && !this.isProcessing) {
        this.saveBatch();
      }
      // 同步检查 Redis 队列并尝试批量落库
      void this.saveFromRedis();
    }, this.BATCH_SAVE_INTERVAL);

    this.logger.log(
      `🚀 IP记录批量保存任务已启动，间隔：${this.BATCH_SAVE_INTERVAL}ms，最小批量：${this.MIN_BATCH_SIZE}`,
    );
  }

  /**
   * 模块销毁时的清理工作
   */
  async onModuleDestroy() {
    this.logger.log('🔄 IpService 正在执行清理工作...');

    // 1. 清理定时器
    if (this.batchSaveTimer) {
      clearInterval(this.batchSaveTimer);
      this.batchSaveTimer = null;
      this.logger.log('✅ 定时批量保存任务已停止');
    }

    // 2. 保存队列中剩余的数据
    if (this.ipQueue.length > 0) {
      this.logger.log(
        `📤 正在保存队列中剩余的 ${this.ipQueue.length} 条IP记录...`,
      );
      await this.saveBatch();
      this.logger.log('✅ 队列中的数据已保存完成');
    }

    // 3. 输出最终统计信息
    this.logger.log(
      `📊 IpService 最终统计: 处理${this.stats.totalProcessed}条, 成功保存${this.stats.totalSaved}条, 失败${this.stats.totalFailed}条`,
    );
    this.logger.log('✅ IpService 清理工作完成');
  }

  /**
   * 记录IP访问日志，自动识别IPv4/IPv6（原有同步方法保留）
   */
  async saveIpInfo(
    clientIp: string,
    ipType: 'IPv4' | 'IPv6',
    requestPath: string,
    requestMethod: string,
    userAgent: string,
  ) {
    try {
      // 只传递Ip实体中已定义的属性
      const ipLog = this.ipRepository.create({
        clientIp,
        requestPath,
        requestMethod,
        userAgent,
        ipType: ipType || 'IPv4',
      } as Partial<Ip>);

      const result = await this.ipRepository.save(ipLog);
      this.logger.log(`记录IP访问: ${clientIp} (${ipType}) - ${requestPath}`);
      return result;
    } catch (error) {
      this.logger.error('记录IP访问失败', error);
      throw error;
    }
  }

  /**
   * 获取所有IP访问记录
   */
  async getAllIpLogs() {
    return await this.ipRepository.find({
      order: {
        createTime: 'DESC',
      },
    });
  }

  /**
   * 根据IP地址查询访问记录
   */
  async getLogsByIp(ip: string) {
    return await this.ipRepository.find({
      where: { clientIp: ip },
      order: {
        createTime: 'DESC',
      },
    });
  }

  // ==================== Redis 缓存方案（可选的高级方案）====================

  /**
   * Redis缓存方案示例（需要安装 redis 依赖）
   *
   * 使用方法：
   * 1. 安装依赖：pnpm install redis
   * 2. 在模块中注入Redis客户端
   * 3. 使用 saveToRedis 方法替代 addToQueue
   *
   * 优势：
   * - 数据持久化到Redis，即使服务重启也不会丢失
   * - 可以多实例共享队列
   * - Redis的性能比内存队列更稳定
   */

  async saveToRedis(
    clientIp: string,
    requestPath: string,
    requestMethod: string,
    userAgent?: string,
  ) {
    const { ip, ipType } = extractRealIp(clientIp);

    const ipRecord = JSON.stringify({
      clientIp: ip,
      requestPath,
      requestMethod,
      userAgent,
      ipType,
      timestamp: new Date().toISOString(),
    });

    try {
      // 若使用 lazyConnect，需要确保连接已建立
      if ((this.redisClient as any).status === 'wait') {
        await this.redisClient.connect();
      }

      await this.redisClient.lpush(this.redisQueueKey, ipRecord);

      const queueLength = await this.redisClient.llen(this.redisQueueKey);
      if (queueLength >= this.MAX_QUEUE_SIZE) {
        void this.saveFromRedis();
      }
    } catch (error) {
      // Redis 不可用时回退到内存队列，保证不丢日志
      this.logger.warn(`Redis 不可用，回退到内存队列: ${String(error)}`);
      this.addToQueue(ip, ipType, requestPath, requestMethod, userAgent);
    }
  }

  async saveFromRedis() {
    try {
      if ((this.redisClient as any).status === 'wait') {
        await this.redisClient.connect();
      }

      const records = await this.redisClient.lrange(this.redisQueueKey, 0, -1);
      if (records.length === 0) return;

      // 清空Redis队列（先删，再尝试落库）
      await this.redisClient.del(this.redisQueueKey);

      const ipRecords = records.map((record) => JSON.parse(record));

      try {
        await this.ipRepository
          .createQueryBuilder()
          .insert()
          .into(Ip)
          .values(
            ipRecords.map((r) => ({
              clientIp: r.clientIp,
              requestPath: r.requestPath,
              requestMethod: r.requestMethod,
              userAgent: r.userAgent,
              ipType: r.ipType,
              createTime: new Date(r.timestamp),
            })),
          )
          .orIgnore()
          .execute();

        this.logger.log(`从Redis批量保存 ${ipRecords.length} 条记录成功`);
      } catch (error) {
        this.logger.error('从Redis批量保存失败', error);
        for (const record of records) {
          await this.redisClient.lpush(this.redisQueueKey, record);
        }
      }
    } catch (error) {
      // Redis 不可用，忽略，等待下次周期
      this.logger.warn(`Redis 不可用，跳过本轮落库: ${String(error)}`);
    }
  }
}
