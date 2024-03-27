import { Module } from '@nestjs/common';
import { PrismaService } from '../service/prisma.service';
import { PostController } from '../controller/post.controller';
import { PostService } from '../service/post.service';

@Module({
  controllers: [PostController],
  providers: [PostController, PrismaService, PostService],
})
export class PostModule {}
