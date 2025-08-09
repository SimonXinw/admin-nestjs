import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpController } from './ip.controller';
import { IpService } from './ip.service';
import { Ip } from './entities/admin/ip.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ip], 'admin'), // 使用 admin 数据库连接
  ],
  controllers: [IpController],
  providers: [IpService],
  exports: [IpService],
})
export class IpModule { } 