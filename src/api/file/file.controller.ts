import { NextFunction } from 'express';
import { Controller, Get, Next, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('/uploads')
export class FileController {
  @UseGuards(AuthGuard)
  @Get(':filename')
  getFile(@Next() next: NextFunction) {
    next();
  }
}
