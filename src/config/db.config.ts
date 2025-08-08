import { DataSource, DataSourceOptions } from 'typeorm';

// 数据库连接基础配置
const baseConnectionConfig = {
  type: 'mysql' as const,
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'AWOLVision2501..',
  // password: '123456',
  
  // 🔧 添加连接池和性能优化配置
  extra: {
    // 连接池配置
    connectionLimit: 50,          // 最大连接数，从默认10增加到50
    acquireTimeout: 30000,        // 获取连接超时时间(30秒)
    timeout: 60000,               // 查询超时时间(60秒)
    reconnect: true,              // 自动重连
    
    // MySQL性能优化参数
    charset: 'utf8mb4',
    dateStrings: false,           // 使用Date对象而不是字符串
    supportBigNumbers: true,      // 支持大数字
    bigNumberStrings: false,      // 大数字返回为Number对象
    multipleStatements: false,    // 安全考虑，禁用多语句
    
    // 连接保活和清理
    idleTimeout: 300000,          // 空闲连接5分钟后关闭
    evictionRunIntervalMillis: 60000, // 每分钟检查一次空闲连接
    numTestsPerRun: 3,            // 每次检查3个连接
    
    // 网络优化
    connectTimeout: 10000,        // 连接超时10秒
    socketTimeout: 30000,         // Socket超时30秒
  }
};

// school 数据库配置（原有的）
const schoolConfig: DataSourceOptions = {
  ...baseConnectionConfig,
  database: 'school',
  synchronize: false, // 🚀 生产环境关闭自动同步，提升性能
};

// admin 数据库配置（新增的）
const adminConfig: DataSourceOptions = {
  ...baseConnectionConfig,
  database: 'admin',
  synchronize: false, // 🚀 生产环境关闭自动同步，提升性能
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
    .map((dbConfig) => dbConfig.config.database)
    .filter((dbName) => dbName && typeof dbName === 'string') as string[];
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
