export default {
  // 服务基本配置
  SERVICE_CONFIG: {
    // 端口
    port: 4000,
  },

  // 数据库配置
  DATABASE_CONFIG: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '123456',
    database: 'school',
    autoLoadEntities: true,
    synchronize: true,
  },
}; 