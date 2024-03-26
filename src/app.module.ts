import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { PostService } from './post.service';
import { PrismaService } from './prisma.service';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [UserService, PostService, PrismaService, AppService],
})
export class AppModule {}
