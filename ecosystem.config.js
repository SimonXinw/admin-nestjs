module.exports = {
  apps: [
    {
      // 应用名称
      name: 'admin-nestjs',
      
      // 启动脚本路径
      script: 'dist/main.js',
      
      // 工作目录
      cwd: './',
      
      // 实例数量 (0 = CPU核心数, 或指定具体数量如 2)
      instances: 'max',
      
      // 集群模式
      exec_mode: 'cluster',
      
      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      
      // 开发环境变量
      env_development: {
        NODE_ENV: 'development',
        PORT: 4000
      },
      
      // 生产环境变量
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      
      // 自动重启配置
      autorestart: true,
      
      // 监听文件变化 (生产环境建议设为 false)
      watch: false,
      
      // 最大内存限制 (超过则重启)
      max_memory_restart: '1G',
      
      // 错误重启配置
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      
      // 日志时间格式
      time: true,
      
      // 合并日志
      merge_logs: true,
      
      // 日志轮转
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 进程 ID 文件
      pid_file: './pids/admin-nestjs.pid',
      
      // 启动前执行的命令
      pre_start: 'npm run build',
      
      // 健康检查
      health_check_grace_period: 3000,
      
      // Node.js 参数
      node_args: '--max-old-space-size=2048',
      
      // 忽略的监听文件
      ignore_watch: [
        'node_modules',
        'logs',
        'pids',
        'dist',
        '*.log'
      ],
      
      // 实例变量
      instance_var: 'INSTANCE_ID',
      
      // 源映射支持
      source_map_support: true,
      
      // 监控配置
      pmx: true,
      
      // 优雅关闭超时
      kill_timeout: 5000,
      
      // 进程标题
      treekill: true
    }
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
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 