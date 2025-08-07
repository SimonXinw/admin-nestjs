import { IsString, IsArray, IsNumber } from 'class-validator';

export class ClassesDto {
  @IsString()
  className: string;

  @IsArray()
  @IsNumber({}, { each: true })
  students: number[];
} 