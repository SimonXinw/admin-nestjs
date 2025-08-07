// students.module.ts
import { Module } from '@nestjs/common';
import { Student } from './entities/students.entity';
import { Classes } from './entities/classes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Classes])],
  providers: [StudentsService, Student, Classes],
  controllers: [StudentsController],
})
export class StudentsModule {} 