import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('ip')
export class Ip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 45, comment: '客户端IP地址' })
  clientIp: string;

  @Column({ type: 'varchar', length: 255, comment: '请求的URL路径' })
  requestPath: string;

  @Column({ type: 'varchar', length: 10, comment: '请求方法' })
  requestMethod: string;

  @Column({ type: 'text', nullable: true, comment: 'User-Agent信息' })
  userAgent: string;

  @CreateDateColumn({ comment: '访问时间' })
  createTime: Date;
} 