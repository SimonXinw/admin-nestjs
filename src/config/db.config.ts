import { DataSource, DataSourceOptions } from 'typeorm';

// school 数据库配置（原有的）
const schoolConfig: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'school',
  synchronize: false, // 数据库自动同步 entity 文件修改
};

// admin 数据库配置（新增的）
const adminConfig: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'admin',
  synchronize: true, // 开发阶段可以自动同步表结构
};

// school 数据库 - 用于 nestjs typeorm 初始化
export const ormConfigSchool: DataSourceOptions = {
  ...schoolConfig,
  // 只包含 sensitive、students 模块下的 entities
  entities: [
    'dist/sensitive/entities/*.entity{.js,.ts}',
    'dist/students/entities/*.entity{.js,.ts}',
  ],
};

// admin 数据库 - 用于 nestjs typeorm 初始化
export const ormConfigAdmin: DataSourceOptions = {
  ...adminConfig,
  entities: ['dist/ip/entities/admin/*.entity{.js,.ts}'],
  // entities: [__dirname + '/../ip/entities/admin/*.entity{.ts,.js}'],
};

// 该对象 typeorm cli 迁移时使用（保持原有的配置）
const ormConfigForCli: DataSourceOptions = {
  ...schoolConfig,
  entities: ['src/**/entities/*.entity{.js,.ts}'],
  migrations: ['migrations/*{.js,.ts}'],
  subscribers: ['subscribers/*{.js,.ts}'],
  logger: 'file',
  logging: true,
};

// 实例化dataSource，用以之后cli使用
const dataSource = new DataSource(ormConfigForCli);

// 此处的dataSource需要 export default才可以使用
export default dataSource;
