import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensitiveController } from './sensitive/sensitive.controller';
import { SensitiveModule } from './sensitive/sensitive.module';
import { SensitiveInterceptor } from './common/interceptors/sensitive.interceptor';
import { IpModule } from './ip/ip.module';
import { Ip } from './ip/entities/admin/ip.entity';
import { Student } from './students/entities/students.entity';
import { Classes } from './students/entities/classes.entity';
import { Sensitive } from './sensitive/entities/sensitive.entity';
// import env from 'config';
import { ormConfigSchool, ormConfigAdmin } from './config/db.config';

@Module({
  imports: [
    StudentsModule, 
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
    SensitiveModule,
    IpModule, // 导入IP模块
  ],
  controllers: [AppController, SensitiveController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SensitiveInterceptor,
    },
  ],
})
export class AppModule {}
