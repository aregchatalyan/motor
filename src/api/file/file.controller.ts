import { NextFunction } from 'express';
import { Controller, Get, Next, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Files')
@Controller('uploads')
export class FileController {
  @ApiOperation({ summary: 'Get file by name' })
  @ApiBearerAuth()
  @ApiParam({ name: 'filename', description: 'The name of the file to retrieve' })
  @ApiOkResponse({
    description: 'The requested file.',
    schema: {
      type: 'string',
      format: 'binary'
    }
  })
  @ApiNotFoundResponse({ description: 'File not found.' })
  @UseGuards(AuthGuard)
  @Get(':filename')
  getFile(@Next() next: NextFunction) {
    next();
  }
}
