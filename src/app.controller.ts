import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  HttpException,
  NotFoundException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PostService } from './post.service';
import { User as UserModel, Post as PostModel, Prisma } from '@prisma/client';
import { AppService } from './app.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { AuthGuard } from './auth.guard';

class RegisterUserDTO {
  @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @IsNotEmpty() password: string;
}

class LoginDTO {
  @IsEmail() email: string;
  @IsNotEmpty() password: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly appService: AppService,
    private jwtService: JwtService,
  ) {}

  // AUTH
  @Post('register')
  async signupUser(@Body() userData: RegisterUserDTO): Promise<{
    statusCode: number;
    data: Partial<UserModel>;
  }> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await this.userService.createUser({
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
      });

      return {
        statusCode: 200,
        data: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            'Email or contact number already exist, please provide another one',
            404,
          );
        }
      } else {
        console.log(error);
        throw new HttpException('Something went wrong', 500);
      }
    }
  }

  @Post('login')
  async login(@Body() body: LoginDTO): Promise<{
    statusCode: number;
    data?: { accessToken: string };
    message?: string;
  }> {
    const user = await this.userService.findUser({ email: body.email });

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new HttpException('Invalid email or password', 401);
    }

    return {
      statusCode: 200,
      data: {
        accessToken: await this.jwtService.signAsync({
          sub: user.id,
          email: user.email,
          name: user.name,
        }),
      },
    };
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  getCurrentUser(@Request() req): Promise<{
    statusCode: number;
    data: Partial<UserModel>;
  }> {
    try {
      return req.user;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  // POSTS
  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.postService.post({ id: Number(id) });
  }

  @Get('feed')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @Get('filtered-posts/:searchString')
  async getFilteredPosts(
    @Param('searchString') searchString: string,
  ): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
    });
  }

  @Put('publish/:id')
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.deletePost({ id: Number(id) });
  }

  @Post('post')
  async createDraft(
    @Body() postData: { title: string; content?: string; authorEmail: string },
  ): Promise<PostModel> {
    const { title, content, authorEmail } = postData;
    return this.postService.createPost({
      title,
      content,
      author: {
        connect: { email: authorEmail },
      },
    });
  }

  // HEALTH CHECK
  @Get('/')
  getHello() {
    return this.appService.getHello();
  }
}
