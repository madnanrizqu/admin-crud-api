import {
  Body,
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { User as UserModel } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthGuard } from '../guard/auth.guard';

class RegisterUserDTO {
  @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @IsNotEmpty() password: string;
}

class LoginDTO {
  @IsEmail() email: string;
  @IsNotEmpty() password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

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
      if (error instanceof PrismaClientKnownRequestError) {
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
  @Get('me')
  getCurrentUser(@Request() req): {
    statusCode: number;
    data: Partial<UserModel>;
  } {
    try {
      return {
        statusCode: 200,
        data: { name: req.user.name, id: req.user.id, email: req.user.email },
      };
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
