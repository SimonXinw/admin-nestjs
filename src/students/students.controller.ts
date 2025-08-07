import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentDto } from './dtos/students.dto';
import { ClassesDto } from './dtos/classes.dto';
import { User } from '../common/decorators';
import { UserGuard } from '../common/guards/user.guard';
import { SensitiveOperation } from '../common/decorators';
import { SensitiveType } from '../sensitive/constants';
import { TransformNamePipe } from '../common/pipes/name.pipes';
import { ApiTags } from '@nestjs/swagger';

@Controller('students')
@ApiTags('学生')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // Link - http://localhost:8888/students/who-are-you-get?name=xinwnag
  @Get('who-are-you-get')
  whoAreYou(@Query('name', TransformNamePipe) name: string) {
    return this.studentsService.findAll(name);
  }

  // 测试链接 -  curl -X POST -d"name=NB"  http://127.0.0.1:8888/students/who-are-you-post
  // 测试链接 -  curl -X POST http://127.0.0.1:8888/students/who-are-you-post -H 'Content-Type: application/json' -d '{"name": 1}'
  // 测试链接 -  curl -X POST http://127.0.0.1:8888/students/who-are-you-post -H 'Content-Type: application/json' -d '{"user": "xinwang", "name": "辛望"}'
  @UseGuards(UserGuard)
  @Post('who-are-you-post')
  whoAreYouPost(@Body() student: StudentDto) {
    return this.studentsService.ImXW(student.name) ?? 'not fund';
  }

  // Link - http://localhost:8888/students/get-name-by-id?id=1
  @Get('get-name-by-id')
  getNameById(@Query('id', ParseIntPipe) id: number) {
    return this.studentsService.getStudentName(id);
  }

  // curl -X POST http://127.0.0.1:8888/students/set-student-name -H 'Content-Type: application/json' -d '{"user": "xinwang"}'
  // @NoUser()
  @SensitiveOperation(SensitiveType.Set)
  @Post('set-student-name')
  setStudentName(@User() user: string) {
    return this.studentsService.setStudentName(user);
  }

  // Link - http://localhost:8888/students/delete-student-name?name=xinwang
  @Get('delete-student-name')
  removeStudent(@Query('name') name: string) {
    return this.studentsService.removeStudent(name);
  }

  // Link - http://localhost:8888/students/update-student-name?id=2
  @Get('update-student-name')
  updateStudent(@Query('id', ParseIntPipe) id: number) {
    return this.studentsService.updateStudent(id);
  }

  // curl -X POST http://127.0.0.1:8888/students/who-is-request -H 'Content-Type: application/json' -d '{"user": "xinwang"}'
  @Post('who-is-request')
  whoIsReq(@User() user: string) {
    return user;
  }

  // 测试数据 -> http://localhost:8888/students/get-class?id=1
  @Get('get-class')
  getClass(@Query('id', ParseIntPipe) id: number) {
    return this.studentsService.findClass(id);
  }

  // 插入 classes-> curl -X POST http://127.0.0.1:8888/students/set-class -H 'Content-Type: application/json' -d '{"className": "blog", "students": [1,2]}'
  @Post('set-class')
  setClass(@Body() classes: ClassesDto) {
    return this.studentsService.setClass(classes.className, classes.students);
  }
} 