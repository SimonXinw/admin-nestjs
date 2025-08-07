import { DataSource, DataSourceOptions } from 'typeorm';

// 数据库连接基础配置
const baseConnectionConfig = {
  type: 'mysql' as const,
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
};

// school 数据库配置（原有的）
const schoolConfig: DataSourceOptions = {
  ...baseConnectionConfig,
  database: 'school',
  synchronize: true, // 数据库自动同步 entity 文件修改
};

// admin 数据库配置（新增的）
const adminConfig: DataSourceOptions = {
  ...baseConnectionConfig,
  database: 'admin',
  synchronize: true, // 开发阶段可以自动同步表结构
};

// 导出数据库配置数组，用于动态初始化
export const databaseConfigs = [
  { name: 'school', config: schoolConfig },
  { name: 'admin', config: adminConfig },
  // 📝 添加新数据库时，只需在此处添加配置即可，会自动创建数据库
  // { name: 'newdb', config: { ...baseConnectionConfig, database: 'newdb', synchronize: true } },
];

// 导出连接配置，用于数据库初始化
export const connectionConfig = baseConnectionConfig;

// 实用函数：获取所有数据库名称
export function getAllDatabaseNames(): string[] {
  return databaseConfigs
    .map(dbConfig => dbConfig.config.database)
    .filter(dbName => dbName && typeof dbName === 'string') as string[];
}

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
