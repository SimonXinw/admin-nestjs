<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Admin NestJS 项目

## 项目概述

这是一个基于 NestJS 11 的后端管理系统，从 blog-nestjs（NestJS 9）项目迁移所有业务逻辑而来。

## 迁移内容

从 blog-nestjs 项目迁移了以下模块和功能：

### 🔧 配置模块
- 数据库配置 (`src/config/db.config.ts`)
- 环境配置 (`config/env.development.ts`, `config/env.production.ts`)
- Swagger 文档配置 (`src/swaggerDoc.ts`)

### 🛡️ 通用模块 (`src/common/`)
- **装饰器**: 用户装饰器、敏感操作装饰器
- **守卫**: 用户权限守卫
- **拦截器**: 敏感操作拦截器
- **管道**: 名称转换管道

### 🔒 敏感操作模块 (`src/sensitive/`)
- 敏感操作记录实体
- 敏感操作服务
- 敏感操作控制器
- 敏感操作枚举常量

### 👥 学生管理模块 (`src/students/`)
- 学生实体 (`Student`)
- 班级实体 (`Classes`)  
- 学生服务 (CRUD 操作)
- 学生控制器 (API 接口)
- DTO 数据传输对象

## 版本升级变化

从 NestJS 9 升级到 NestJS 11，主要变化：

- 依赖版本更新：
  - `@nestjs/common`: ^9.0.0 → ^11.0.1
  - `@nestjs/core`: ^9.0.0 → ^11.0.1
  - `@nestjs/swagger`: ^6.2.1 → ^8.0.0
  - `@nestjs/typeorm`: ^9.0.1 → ^10.0.2
  - `typeorm`: ^0.3.12 → ^0.3.20
- 代码语法保持兼容，无需修改业务逻辑代码

## 安装和运行

### 1. 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 2. 数据库配置

确保 MySQL 数据库运行，并创建名为 `school` 的数据库：

\`\`\`sql
CREATE DATABASE school;
\`\`\`

修改 `src/config/db.config.ts` 中的数据库连接配置。

### 3. 运行项目

开发模式：
\`\`\`bash
pnpm start:dev
\`\`\`

生产模式：
\`\`\`bash
pnpm build
pnpm start:prod
\`\`\`

### 4. 访问接口

- 应用地址: http://localhost:8888
- Swagger 文档: http://localhost:8888/api

## API 接口

### 学生管理接口

- `GET /students/who-are-you-get?name=xxx` - 获取学生信息
- `POST /students/who-are-you-post` - 创建学生（需要用户认证）
- `GET /students/get-name-by-id?id=1` - 根据ID获取学生姓名
- `POST /students/set-student-name` - 设置学生姓名（敏感操作）
- `GET /students/delete-student-name?name=xxx` - 删除学生
- `GET /students/update-student-name?id=1` - 更新学生姓名
- `POST /students/who-is-request` - 获取当前请求用户
- `GET /students/get-class?id=1` - 获取班级信息
- `POST /students/set-class` - 创建班级

### 敏感操作接口

- `GET /sensitive/get-by-type?type=Set` - 根据类型查询敏感操作记录

## 数据库迁移

支持 TypeORM 迁移命令：

\`\`\`bash
# 生成迁移文件
pnpm migration:generate

# 运行迁移
pnpm migration:run

# 回滚迁移
pnpm migration:revert
\`\`\`

## 开发工具

- **格式化代码**: `pnpm format`
- **代码检查**: `pnpm lint`
- **运行测试**: `pnpm test`
- **覆盖率测试**: `pnpm test:cov`

## 项目结构

\`\`\`
src/
├── common/               # 通用模块
│   ├── decorators.ts    # 自定义装饰器
│   ├── guards/          # 守卫
│   ├── interceptors/    # 拦截器
│   └── pipes/           # 管道
├── config/              # 配置文件
│   └── db.config.ts     # 数据库配置
├── sensitive/           # 敏感操作模块
│   ├── entities/        # 实体
│   ├── constants.ts     # 常量定义
│   ├── sensitive.controller.ts
│   ├── sensitive.service.ts
│   └── sensitive.module.ts
├── students/            # 学生管理模块
│   ├── entities/        # 实体
│   ├── dtos/           # 数据传输对象
│   ├── students.controller.ts
│   ├── students.service.ts
│   └── students.module.ts
├── app.module.ts        # 主应用模块
├── main.ts             # 应用入口
└── swaggerDoc.ts       # Swagger配置
\`\`\`

## 技术栈

- **框架**: NestJS 11
- **数据库**: MySQL + TypeORM
- **文档**: Swagger
- **验证**: class-validator
- **包管理**: pnpm
