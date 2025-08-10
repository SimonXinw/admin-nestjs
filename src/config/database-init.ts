import { Logger } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { databaseConfigs, connectionConfig, getAllDatabaseNames } from './db.config';

const logger = new Logger('DatabaseInit');

export async function initializeDatabases() {
  logger.log(`🔍 尝试连接 MySQL 服务器: ${connectionConfig.host}:${connectionConfig.port}`);
  
  try {
    const connection = await mysql.createConnection({
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.username,
      password: connectionConfig.password,
      // 不指定数据库，连接到 MySQL 服务器
      connectTimeout: 10000, // 10秒连接超时
    });

    try {
      logger.log(`✅ MySQL 连接成功！检测到 ${databaseConfigs.length} 个数据库配置`);
      
      // 获取所有需要创建的数据库名称
      const databaseNames = getAllDatabaseNames();
      
      if (databaseNames.length === 0) {
        logger.warn('⚠️  未找到需要初始化的数据库配置');
        return;
      }
      
      logger.log(`📋 需要检查/创建的数据库: ${databaseNames.join(', ')}`);
      
      // 动态创建所有配置的数据库
      for (const dbName of databaseNames) {
        await createDatabaseIfNotExists(connection, dbName);
      }
      
      logger.log(`✅ 所有数据库初始化完成，共处理 ${databaseNames.length} 个数据库`);
    } finally {
      await connection.end();
    }
  } catch (error) {
    logger.error('❌ 数据库连接失败:', getDetailedErrorMessage(error));
    logger.error('💡 请检查以下配置:');
    logger.error(`   - MySQL 服务是否启动？`);
    logger.error(`   - 连接地址: ${connectionConfig.host}:${connectionConfig.port}`);
    logger.error(`   - 用户名: ${connectionConfig.username}`);
    logger.error(`   - 密码是否正确？`);
    logger.error(`   - 用户是否有创建数据库的权限？`);
    
    // 提供具体的解决建议
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      logger.error('🔧 解决方案: 检查用户名和密码，或者运行以下 MySQL 命令授权:');
      logger.error(`   GRANT ALL PRIVILEGES ON *.* TO '${connectionConfig.username}'@'localhost';`);
      logger.error(`   FLUSH PRIVILEGES;`);
    } else if (error.code === 'ECONNREFUSED') {
      logger.error('🔧 解决方案: 启动 MySQL 服务');
      logger.error('   Windows: net start mysql 或通过服务管理器启动');
      logger.error('   macOS: brew services start mysql');
      logger.error('   Linux: sudo systemctl start mysql');
    }
    
    throw error;
  }
}

function getDetailedErrorMessage(error: any): string {
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    return `访问被拒绝 - 用户名或密码错误 (${error.sqlState})`;
  } else if (error.code === 'ECONNREFUSED') {
    return `连接被拒绝 - MySQL 服务可能未启动`;
  } else if (error.code === 'ETIMEDOUT') {
    return `连接超时 - 检查网络和防火墙设置`;
  } else if (error.code === 'ENOTFOUND') {
    return `找不到主机 - 检查主机地址`;
  }
  return error.message || '未知错误';
}

async function createDatabaseIfNotExists(connection: mysql.Connection, dbName: string) {
  try {
    logger.log(`🔍 检查数据库 '${dbName}'...`);
    
    // 检查数据库是否存在
    const [rows] = await connection.execute(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbName]
    );

    if ((rows as any[]).length === 0) {
      // 数据库不存在，创建它
      logger.log(`🏗️  正在创建数据库 '${dbName}'...`);
      await connection.execute(`CREATE DATABASE \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      logger.log(`✅ 数据库 '${dbName}' 创建成功`);
    } else {
      logger.log(`✅ 数据库 '${dbName}' 已存在，跳过创建`);
    }
  } catch (error) {
    logger.error(`❌ 处理数据库 '${dbName}' 时出错:`, error);
    throw new Error(`Failed to initialize database '${dbName}': ${error.message}`);
  }
} 