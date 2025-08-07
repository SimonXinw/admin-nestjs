import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensitiveController } from './sensitive/sensitive.controller';
import { SensitiveModule } from './sensitive/sensitive.module';
import { SensitiveInterceptor } from './common/interceptors/sensitive.interceptor';
// import env from 'config';
import { ormConfig } from './config/db.config';

@Module({
  imports: [StudentsModule, TypeOrmModule.forRoot(ormConfig), SensitiveModule],
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
