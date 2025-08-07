import { Controller, Get, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IpService } from './ip.service';

@Controller('ip')
@ApiTags('IP日志')
export class IpController {
  constructor(private readonly ipService: IpService) {}

  /**
   * 获取客户端IP地址并记录访问日志
   */
  @Get('my')
  @ApiOperation({ summary: '获取客户端IP地址' })
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
    const realIp = typeof clientIp === 'string' 
      ? clientIp.split(',')[0].trim()
      : clientIp;

    // 获取请求信息
    const requestPath = req.url;
    const requestMethod = req.method;
    const userAgent = req.headers['user-agent'];

    // 记录到数据库
    await this.ipService.logIpAccess(
      realIp,
      requestPath,
      requestMethod,
      userAgent,
    );

    // 返回客户端IP信息
    return {
      success: true,
      message: '成功获取客户端IP',
      data: {
        clientIp: realIp,
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
} 