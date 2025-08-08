module.exports = {
  apps: [
    {
      // 应用名称
      name: 'admin-nestjs',

      // 启动脚本路径 - 直接使用构建后的文件
      script: 'dist/src/main.js',

      // 工作目录
      cwd: './',

      // 🔄 保持单实例模式（状态管理需要）
      instances: 1,

      // 🔄 fork模式 - 适合有状态应用
      exec_mode: 'fork',

      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        // 🚀 Node.js性能优化环境变量
        UV_THREADPOOL_SIZE: 128, // 增加线程池大小，默认4
      },

      // 开发环境变量
      env_development: {
        NODE_ENV: 'development',
        PORT: 4000,
        UV_THREADPOOL_SIZE: 64,
      },

      // 生产环境变量
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        UV_THREADPOOL_SIZE: 128,
      },

      // 自动重启配置
      autorestart: true,

      // 监听文件变化 (生产环境建议设为 false)
      watch: false,

      // 🚀 调整内存限制 - 单实例可以设置更高
      max_memory_restart: '4G', // 增加到6G，给队列更多内存

      // 重启配置
      restart_delay: 4000,
      max_restarts: 5,
      min_uptime: '10s',

      // 日志配置
      log_file: './logs/admin-combined.log',
      out_file: './logs/admin-out.log',
      error_file: './logs/admin-error.log',

      // 日志时间格式
      time: true,

      // 合并日志
      merge_logs: true,

      // 日志轮转
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // 进程 ID 文件
      pid_file: './pids/admin-nestjs.pid',

      // 忽略的监听文件
      ignore_watch: ['node_modules', 'logs', 'pids', 'dist', '*.log'],

      // 源映射支持
      source_map_support: true,

      // 优雅关闭超时
      kill_timeout: 5000,

      // 进程标题
      treekill: true,

      // 🚀 新增：单实例性能优化配置
      listen_timeout: 8000,
      kill_retry_time: 100,
    },
  ],

  // 部署配置 (可选)
  deploy: {
    production: {
      user: 'root',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'your-git-repo',
      path: '/var/www/admin-nestjs',
      'pre-deploy-local': '',
      'post-deploy':
        'git pull && pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
