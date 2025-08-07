import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as packageConfig from '../package.json'; // 这里需要配置 tsconfig.json -> "resolveJsonModule": true 才可以引入 json 文件

export const generateSwaggerDocument = (app) => {
  const { name, version, description } = packageConfig;

  //注入文档
  const options = new DocumentBuilder()
    .setTitle(name)
    .setDescription(description)
    .setVersion(version)
    .addTag('Api/V1')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, swaggerDocument);
}; 