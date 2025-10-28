import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type,Accept,Authorization',
    },
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('FTRL API')
    .setDescription('FTRL API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
  const host = process.env.NODE_ENV === 'production' 
    ? process.env.HEROKU_APP_NAME 
      ? `${process.env.HEROKU_APP_NAME}.herokuapp.com` 
      : 'your-domain.com'
    : 'localhost';
  
  console.log(`Application is running on port: ${port}`);
  console.log(`WebSocket server is running on ${protocol}://${host}/socket.io/`);
}
bootstrap();
