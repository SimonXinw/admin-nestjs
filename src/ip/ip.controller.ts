import { Controller, Get, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IpService } from './ip.service';
import { extractRealIp } from '../common/utils/ip.utils';

@Controller('ip')
@ApiTags('IP日志')
export class IpController {
  constructor(private readonly ipService: IpService) {}

  /**
   * 获取客户端IP地址并记录访问日志（高性能版本 - 推荐）
   */
  @Get('my')
  @ApiOperation({ summary: '获取客户端IP地址（高性能版本）' })
  @ApiResponse({ status: 200, description: '成功获取客户端IP' })
  async getClientIp(@Request() req: any) {
    // 获取客户端真实IP地址（考虑代理的情况）
    const clientIp =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      '未知IP';

    // 处理可能存在的多个IP地址情况（取第一个）
    const realIp =
      typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : clientIp;

    // 获取请求信息
    const requestPath = req.url;
    const requestMethod = req.method;
    const userAgent = req.headers['user-agent'];

    // 使用 extractRealIp 提取 ip 和 ipType
    const { ip, ipType } = extractRealIp(realIp);

    // 使用队列方式记录（推荐：高性能，批量保存）
    this.ipService.addToQueue(
      ip,
      ipType,
      requestPath,
      requestMethod,
      userAgent,
    );

    // 立即返回客户端IP信息，不等待数据库操作
    return {
      success: true,
      message: '成功获取客户端IP',
      data: {
        clientIp: ip,
        ipType: ipType || 'IPv4',
        requestPath,
        requestMethod,
        userAgent,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 获取客户端IP地址并记录访问日志（异步版本）
   */
  @Get('my-async')
  @ApiOperation({ summary: '获取客户端IP地址（异步版本）' })
  @ApiResponse({ status: 200, description: '成功获取客户端IP' })
  async getClientIpAsync(@Request() req: any) {
    // 获取客户端真实IP地址（考虑代理的情况）
    const clientIp =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      '未知IP';

    // 处理可能存在的多个IP地址情况（取第一个）
    const realIp =
      typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : clientIp;

    const { ip, ipType } = extractRealIp(realIp);

    // 获取请求信息
    const requestPath = req.url;
    const requestMethod = req.method;
    const userAgent = req.headers['user-agent'];

    // 异步记录到数据库（不等待完成，直接返回结果）
    this.ipService.saveIpInfoAsync(
      ip,
      ipType,
      requestPath,
      requestMethod,
      userAgent,
    );

    // 立即返回客户端IP信息，不等待数据库操作
    return {
      success: true,
      message: '成功获取客户端IP（异步保存）',
      data: {
        clientIp: ip,
        ipType: ipType || 'IPv4',
        requestPath,
        requestMethod,
        userAgent,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 查询所有IP访问记录
   */
  @Get('get-all-logs')
  @ApiOperation({ summary: '获取所有IP访问记录' })
  @ApiResponse({ status: 200, description: '成功获取IP访问记录' })
  async getAllLogs() {
    const logs = await this.ipService.getAllIpLogs();
    return {
      success: true,
      message: '成功获取IP访问记录',
      data: logs,
    };
  }

  /**
   * 根据IP地址查询访问记录
   */
  @Get('get-logs-by-ip')
  @ApiOperation({ summary: '根据IP地址查询访问记录' })
  @ApiResponse({ status: 200, description: '成功获取指定IP的访问记录' })
  async getLogsByIp(@Query('ip') ip: string) {
    if (!ip) {
      return {
        success: false,
        message: '请提供IP地址参数',
        data: null,
      };
    }

    const logs = await this.ipService.getLogsByIp(ip);
    return {
      success: true,
      message: `成功获取IP ${ip} 的访问记录`,
      data: logs,
    };
  }

  /**
   * 获取IP记录队列状态（监控用）
   */
  @Get('queue-status')
  @ApiOperation({ summary: '获取IP记录队列状态' })
  @ApiResponse({ status: 200, description: '成功获取队列状态信息' })
  async getQueueStatus() {
    const status = this.ipService.getQueueStatus();
    return {
      success: true,
      message: '成功获取队列状态',
      data: status,
    };
  }

  /**
   * 🚀 新增：性能监控仪表板（用于检查优化效果）
   */
  @Get('performance-dashboard')
  @ApiOperation({ summary: '获取性能监控仪表板数据' })
  @ApiResponse({ status: 200, description: '成功获取性能监控数据' })
  async getPerformanceDashboard() {
    const queueStatus = this.ipService.getQueueStatus();
    const memoryUsage = process.memoryUsage();
    
    // 计算性能指标
    const performanceMetrics = {
      // 队列健康度
      queueHealth: {
        status: queueStatus.queueLength < queueStatus.maxQueueSize * 0.8 ? '健康' : '警告',
        currentLoad: queueStatus.queueLength,
        maxCapacity: queueStatus.maxQueueSize,
        usagePercentage: ((queueStatus.queueLength / queueStatus.maxQueueSize) * 100).toFixed(2) + '%',
        isProcessing: queueStatus.isProcessing,
      },
      
      // 批量处理效率
      batchEfficiency: {
        batchInterval: queueStatus.batchInterval + 'ms',
        minBatchSize: queueStatus.minBatchSize,
        lastBatchSize: queueStatus.statistics.lastBatchSize,
        averageLatency: queueStatus.statistics.averageLatency + 'ms',
        totalProcessed: queueStatus.statistics.totalProcessed,
        totalSaved: queueStatus.statistics.totalSaved,
        totalFailed: queueStatus.statistics.totalFailed,
        successRate: queueStatus.statistics.totalProcessed > 0 
          ? ((queueStatus.statistics.totalSaved / queueStatus.statistics.totalProcessed) * 100).toFixed(2) + '%'
          : '100%',
      },
      
      // 内存使用情况
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB',
      },
      
      // 性能建议
      recommendations: this.generatePerformanceRecommendations(queueStatus),
    };

    return {
      success: true,
      message: '成功获取性能监控数据',
      data: performanceMetrics,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🚀 新增：生成性能优化建议
   */
  private generatePerformanceRecommendations(queueStatus: any): string[] {
    const recommendations: string[] = [];
    
    // 队列使用率检查
    const queueUsage = queueStatus.queueLength / queueStatus.maxQueueSize;
    if (queueUsage > 0.8) {
      recommendations.push('队列使用率较高，建议增加MAX_QUEUE_SIZE或减少BATCH_SAVE_INTERVAL');
    }
    
    // 平均延迟检查
    if (queueStatus.statistics.averageLatency > 1000) {
      recommendations.push('批量保存平均延迟较高，建议检查数据库连接池配置');
    }
    
    // 失败率检查
    const failureRate = queueStatus.statistics.totalFailed / 
      (queueStatus.statistics.totalProcessed || 1);
    if (failureRate > 0.05) {
      recommendations.push('批量保存失败率较高，建议检查数据库连接和网络状况');
    }
    
    // 性能良好时的建议
    if (recommendations.length === 0) {
      recommendations.push('性能状况良好，可以考虑进一步增加并发数进行压测');
    }
    
    return recommendations;
  }
}
