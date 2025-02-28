import { NextFunction } from 'express';
import { Controller, Get, Next, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('uploads')
export class FileController {

  @UseGuards(JwtAccessGuard)
  @Get(':filename')
  getFile(@Next() next: NextFunction) {
    next();
  }
}
