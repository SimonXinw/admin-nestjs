import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ip } from './entities/admin/ip.entity';
import { extractRealIp } from '../common/utils/ip.utils';

@Injectable()
export class IpService implements OnModuleDestroy {
  constructor(
    @InjectRepository(Ip, 'admin')
    private readonly ipRepository: Repository<Ip>,
  ) {
    // 启动定时批量保存任务
    this.startBatchSaveTask();
  }

  private readonly logger = new Logger(IpService.name);

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

  // 队列大小限制
  private readonly MAX_QUEUE_SIZE = 1000;
  // 批量保存间隔（毫秒）
  private readonly BATCH_SAVE_INTERVAL = 2000; // 2秒

  // 统计信息
  private stats = {
    totalProcessed: 0, // 总处理数量
    totalSaved: 0, // 成功保存数量
    totalFailed: 0, // 失败数量
    lastBatchTime: new Date(), // 上次批量保存时间
    lastBatchSize: 0, // 上次批量大小
  };

  /**
   * 获取队列状态和统计信息
   */
  getQueueStatus() {
    return {
      queueLength: this.ipQueue.length,
      maxQueueSize: this.MAX_QUEUE_SIZE,
      batchInterval: this.BATCH_SAVE_INTERVAL,
      statistics: {
        ...this.stats,
        queueUsagePercent:
          ((this.ipQueue.length / this.MAX_QUEUE_SIZE) * 100).toFixed(2) + '%',
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
   * 将IP信息添加到内存队列（推荐的高性能方案）
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

    // 如果队列超过限制，立即触发批量保存
    if (this.ipQueue.length >= this.MAX_QUEUE_SIZE) {
      this.logger.warn(`队列已满(${this.MAX_QUEUE_SIZE})，触发立即保存`);
      this.saveBatch();
    }
  }

  /**
   * 批量保存队列中的IP记录
   */
  private async saveBatch() {
    if (this.ipQueue.length === 0) return;

    const batchToSave = [...this.ipQueue];
    this.ipQueue = []; // 清空队列

    try {
      // 批量插入数据库
      await this.ipRepository.insert(batchToSave);

      // 更新统计信息
      this.stats.totalSaved += batchToSave.length;
      this.stats.lastBatchTime = new Date();
      this.stats.lastBatchSize = batchToSave.length;

      this.logger.log(`✅ 批量保存 ${batchToSave.length} 条IP记录成功`);
    } catch (error) {
      // 更新失败统计
      this.stats.totalFailed += batchToSave.length;

      this.logger.error(
        `❌ 批量保存IP记录失败，丢失 ${batchToSave.length} 条记录`,
        error,
      );

      // 如果是数据库连接问题，可以考虑将记录重新加入队列
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        this.logger.warn('检测到数据库连接问题，尝试将记录重新加入队列');
        // 只重新加入一部分，避免无限循环
        const reinsertCount = Math.min(
          batchToSave.length,
          this.MAX_QUEUE_SIZE - this.ipQueue.length,
        );
        this.ipQueue.unshift(...batchToSave.slice(0, reinsertCount));
      }
    }
  }

  /**
   * 启动定时批量保存任务
   */
  private startBatchSaveTask() {
    this.batchSaveTimer = setInterval(() => {
      this.saveBatch();
    }, this.BATCH_SAVE_INTERVAL);

    this.logger.log(
      `IP记录批量保存任务已启动，间隔：${this.BATCH_SAVE_INTERVAL}ms`,
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

  /*
  // Redis客户端示例配置（需要在模块中配置）
  private redisClient: any; // 实际项目中应该使用正确的Redis类型
  
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

    // 将记录推入Redis列表
    await this.redisClient.lpush('ip_logs_queue', ipRecord);
    
    // 如果队列太长，触发批量保存
    const queueLength = await this.redisClient.llen('ip_logs_queue');
    if (queueLength >= this.MAX_QUEUE_SIZE) {
      this.saveFromRedis();
    }
  }

  private async saveFromRedis() {
    const records = await this.redisClient.lrange('ip_logs_queue', 0, -1);
    if (records.length === 0) return;

    // 清空Redis队列
    await this.redisClient.del('ip_logs_queue');

    const ipRecords = records.map(record => JSON.parse(record));
    
    try {
      await this.ipRepository.insert(ipRecords);
      this.logger.log(`从Redis批量保存 ${ipRecords.length} 条记录成功`);
    } catch (error) {
      this.logger.error('从Redis批量保存失败', error);
      // 将失败的记录重新放回Redis
      for (const record of records) {
        await this.redisClient.lpush('ip_logs_queue', record);
      }
    }
  }
  */
}
