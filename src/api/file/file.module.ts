import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileController } from './file.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ FileController ],
  providers: [ JwtService, PrismaService ]
})
export class FileModule {}
