import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [UserService, PrismaService],
})
export class AuthModule {}
