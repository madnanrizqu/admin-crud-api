import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { PostService } from './post.service';
import { PrismaService } from './prisma.service';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { constants } from './constants';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({ global: true, secret: constants.jwtSecret }),
  ],
  controllers: [AppController],
  providers: [UserService, PostService, PrismaService, AppService],
})
export class AppModule {}
