export default {
  // 服务基本配置
  SERVICE_CONFIG: {
    // 端口
    port: 4000,
  },

  // 数据库配置
  DATABASE_CONFIG: {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '123456',
    database: 'school',
    synchronize: true, // 数据库自动同步 entity 文件修改
    autoLoadEntities: true, // 自动链接被 forFeature 注册的实体
    migrations: ['src/migrations/*.ts'], // 主要配置一下这个就可以了
    cli: {
      migrationsDir: 'src/migrations',
    },
  },
}; 