import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  HttpException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostService } from '../service/post.service';
import { Post as PostModel } from '@prisma/client';
import { IsEmail, IsNumberString, IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../guard/auth.guard';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

class CreatePostDraftDTO {
  @IsString() title: string;
  @IsString() content: string;
  @IsEmail() authorEmail: string;
}

class PublishPostParams {
  @IsNumberString() id: number;
}

class PostQueryParams {
  @IsOptional() @IsNumberString() skip: number;
  @IsOptional() @IsNumberString() take: number;
  @IsOptional() @IsString() searchString: string;
}

class GetPostParams {
  @IsNumberString() id: number;
}

class UpdatePostParams {
  @IsNumberString() id: number;
}

class UpdatePostBody {
  @IsOptional() @IsString() title: string;
  @IsOptional() @IsString() content: string;
}

class DeletePostParams {
  @IsNumberString() id: number;
}

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard)
  @Post('')
  async createPostDraft(
    @Body() postData: CreatePostDraftDTO,
  ): Promise<{ statusCode: number; data: PostModel }> {
    const { title, content, authorEmail } = postData;
    try {
      return {
        statusCode: 200,
        data: await this.postService.createPost({
          title,
          content,
          author: {
            connect: { email: authorEmail },
          },
        }),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new HttpException('Author not found', 404);
        }
      }
    }
  }

  @UseGuards(AuthGuard)
  @Put('publish/:id')
  async publishPost(@Param() params: PublishPostParams): Promise<PostModel> {
    const post = await this.postService.post({ id: Number(params.id) });

    if (!post) {
      throw new HttpException('Post not found', 404);
    }

    return this.postService.updatePost({
      where: { id: Number(post.id) },
      data: { published: true },
    });
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getPostById(
    @Param() params: GetPostParams,
  ): Promise<{ statusCode: number; data: PostModel }> {
    const post = await this.postService.post({ id: Number(params.id) });

    if (!post) {
      throw new HttpException('Post not found', 404);
    }

    return {
      statusCode: 200,
      data: post,
    };
  }

  @UseGuards(AuthGuard)
  @Get('')
  async getPosts(@Query() query: PostQueryParams): Promise<{
    statusCode: number;
    data: {
      total: number;
      posts: PostModel[];
    };
  }> {
    const { count, res } = await this.postService.posts({
      ...(query.take ? { take: Number(query.take) } : {}),
      ...(query.skip ? { skip: Number(query.skip) } : {}),
      where: query.searchString
        ? {
            OR: [
              {
                content: { contains: query.searchString },
              },
              {
                title: { contains: query.searchString },
              },
            ],
          }
        : {},
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return {
      statusCode: 200,
      data: {
        total: count,
        posts: res,
      },
    };
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  async updatePost(
    @Param() params: UpdatePostParams,
    @Body() body: UpdatePostBody,
  ): Promise<{ statusCode: number; data: PostModel }> {
    const post = await this.postService.post({ id: Number(params.id) });

    if (!post) {
      throw new HttpException('Post not found', 404);
    }

    return {
      statusCode: 200,
      data: await this.postService.updatePost({
        where: { id: Number(post.id) },
        data: {
          title: body.title,
          content: body.content,
        },
      }),
    };
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deletePost(
    @Param() params: DeletePostParams,
  ): Promise<{ statusCode: number; message: string }> {
    const post = await this.postService.post({ id: Number(params.id) });

    if (!post) {
      throw new HttpException('Post not found', 404);
    }

    await this.postService.deletePost({ id: Number(params.id) });

    return {
      statusCode: 200,
      message: `Successfully deleted post with id ${params.id}`,
    };
  }
}
