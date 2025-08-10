import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { SensitiveController } from './sensitive/sensitive.controller';
import { SensitiveModule } from './sensitive/sensitive.module';
import { SensitiveInterceptor } from './common/interceptors/sensitive.interceptor';
import { IpModule } from './ip/ip.module';

// 导入全局基础设施模块
import { RedisGlobalModule, DatabaseModule } from './modules';

@Module({
  imports: [
    // 全局基础设施模块
    RedisGlobalModule,
    DatabaseModule,
    
    // 业务功能模块
    StudentsModule,
    SensitiveModule,
    IpModule,
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
