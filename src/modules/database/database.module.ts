import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfigSchool, ormConfigAdmin } from '../../config/db.config';

// 导入实体
import { Student } from '../../students/entities/students.entity';
import { Classes } from '../../students/entities/classes.entity';
import { Sensitive } from '../../sensitive/entities/sensitive.entity';
import { Ip } from '../../ip/entities/admin/ip.entity';

/**
 * 数据库全局模块
 * 
 * 统一管理所有数据库连接配置
 * - school 数据库：存储学生、班级、敏感词等业务数据
 * - admin 数据库：存储 IP 管理等管理后台数据
 */
@Global()
@Module({
  imports: [
    // 配置 school 数据库连接（默认连接）
    TypeOrmModule.forRoot({
      ...ormConfigSchool,
      entities: [Student, Classes, Sensitive],
      autoLoadEntities: true,
    }),
    // 配置 admin 数据库连接（命名连接）
    TypeOrmModule.forRoot({
      ...ormConfigAdmin,
      name: 'admin', // 命名连接
      entities: [Ip],
      autoLoadEntities: true,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
