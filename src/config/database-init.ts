import { Logger } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { databaseConfigs, connectionConfig, getAllDatabaseNames } from './db.config';

const logger = new Logger('DatabaseInit');

export async function initializeDatabases() {
  const connection = await mysql.createConnection({
    host: connectionConfig.host,
    port: connectionConfig.port,
    user: connectionConfig.username,
    password: connectionConfig.password,
    // 不指定数据库，连接到 MySQL 服务器
  });

  try {
    logger.log(`🔍 检测到 ${databaseConfigs.length} 个数据库配置`);
    
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
  } catch (error) {
    logger.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
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