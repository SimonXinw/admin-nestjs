import { DataSource, DataSourceOptions } from 'typeorm';

// 基础配置
const baseConfig: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'school',
  synchronize: false, // 数据库自动同步 entity 文件修改
};

// 该对象用于 nestjs typeorm 初始化
export const ormConfig: DataSourceOptions = {
  ...baseConfig,
  entities: ['dist/**/entities/*.entity{.js,.ts}'],
};

// 该对象 typeorm cli 迁移时使用
const ormConfigForCli: DataSourceOptions = {
  ...baseConfig,
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