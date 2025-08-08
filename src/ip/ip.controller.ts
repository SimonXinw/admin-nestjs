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
}
