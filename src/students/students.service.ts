import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Student } from './entities/students.entity';
import { Classes } from './entities/classes.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Classes)
    private readonly classRepository: Repository<Classes>,
  ) {}

  private readonly logger = new Logger(StudentsService.name);

  /**
   * @GET
   */
  async findAll(name?: string) {
    return `I m ${name}`;
  }

  ImXW(name: string) {
    this.logger.log(`log >>>> >>  get student name is ${name}`);

    return 'not fund';
  }

  /**
   * @获取学生姓名
   */
  async getStudentName(id: number) {
    this.logger.log(`Fn Name: ${this.getStudentName.name} >>> data: ${id}`);

    const results = await this.studentRepository.findOne({
      where: { id },
    });

    return results ?? '没找到';
  }

  /**
   * @设置姓名
   */
  async setStudentName(name: string) {
    this.logger.log(`Fn Name: ${this.setStudentName.name} >>> params: ${name}`);

    const results = await this.studentRepository.save({ name });

    return results ?? '没找到';
  }

  /**
   * @删除学生数据
   */
  async removeStudent(name: string) {
    this.logger.log(`Fn Name: ${this.setStudentName.name} >>> params: ${name}`);

    const student = await this.studentRepository.findOne({
      where: { name },
    });

    if (!student) {
      return '没找到';
    }

    const results = await this.studentRepository.remove(student);

    return results ?? '删除失败';
  }

  /**
   * @更新学生数 据
   */
  async updateStudent(id: number) {
    this.logger.log(`Fn Name: ${this.setStudentName.name} >>> params: ${id}`);

    const student = await this.studentRepository.findOneBy({
      id,
    });

    if (!student) {
      return '没找到';
    }

    student.name = '辛望';

    const results = await this.studentRepository.save(student);

    return results ?? '更新失败';
  }

  /**
   * @创建班级
   */
  async setClass(name: string, studentIds: number[]) {
    const students = await this.studentRepository.find({
      where: {
        id: In(studentIds),
      },
    });

    const result = await this.classRepository.save({
      className: name,
      students: students, // 此处直接保存students 的实例，即直接从数据库取出来的数据
    });
    return result;
  }

  /**
   * @查询班级
   */
  async findClass(id: number) {
    const result = await this.classRepository.find({
      where: { id },
      relations: ['students'],
    });
    return result;
  }
} 