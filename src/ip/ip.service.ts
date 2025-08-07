import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ip } from './entities/admin/ip.entity';

@Injectable()
export class IpService {
  constructor(
    @InjectRepository(Ip, 'admin')
    private readonly ipRepository: Repository<Ip>,
  ) {}

  private readonly logger = new Logger(IpService.name);

  /**
   * 记录IP访问日志
   */
  async logIpAccess(
    clientIp: string,
    requestPath: string,
    requestMethod: string,
    userAgent?: string,
  ) {
    try {
      const ipLog = this.ipRepository.create({
        clientIp,
        requestPath,
        requestMethod,
        userAgent,
      });

      const result = await this.ipRepository.save(ipLog);
      this.logger.log(`记录IP访问: ${clientIp} - ${requestPath}`);
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
} 