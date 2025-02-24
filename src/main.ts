import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'public')); //js, css, images
  app.setBaseViewsDir(join(__dirname, '..', 'views')); //view
  app.setViewEngine('ejs');
  // config versioning
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableVersioning({
    type: VersioningType.URI,

    defaultVersion: ['1', '2'],
  });

  //config helmet
  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('Find Jobs API series')
    .setDescription('The JOBS API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'token',
    )
    .addSecurityRequirements('token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const PORT = configService.get<string>('PORT')
  await app.listen(PORT);
  console.log("http://localhost:" + PORT + "/swagger#/")
}
bootstrap();
