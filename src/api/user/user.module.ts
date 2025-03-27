import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ UserController ],
  providers: [ JwtService, UserService, PrismaService ]
})
export class UserModule {}
