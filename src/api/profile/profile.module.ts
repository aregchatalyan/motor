import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ ProfileController ],
  providers: [ JwtService, ProfileService, PrismaService ]
})
export class ProfileModule {}
