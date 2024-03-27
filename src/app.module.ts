import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PostService } from './post.service';
import { PrismaService } from './prisma.service';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { constants } from './constants';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({ global: true, secret: constants.jwtSecret }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [PostService, PrismaService, AppService],
})
export class AppModule {}
