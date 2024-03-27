import { Module } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { PrismaService } from '../service/prisma.service';
import { AuthController } from '../controller/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [UserService, PrismaService],
})
export class AuthModule {}
