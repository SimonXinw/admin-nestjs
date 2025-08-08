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

  // 新增 ipType 字段，兼容 IPv4/IPv6 类型
  @Column({ type: 'varchar', length: 10, nullable: true, comment: 'IP类型（IPv4/IPv6）' })
  ipType?: 'IPv4' | 'IPv6';

  @CreateDateColumn({ comment: '访问时间' })
  createTime: Date;
} 