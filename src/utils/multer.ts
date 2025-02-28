import { extname } from 'node:path';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { diskStorage, FileFilterCallback } from 'multer';

export const multer = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_: Request, file: Express.Multer.File, cb) => {
      cb(null, `motor-${ file.fieldname }-${ Date.now() }${ extname(file.originalname) }`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.mimetype.match(/\/(jpg|png)$/)) {
      return cb(new BadRequestException('Only "jpg|png" files are allowed!'));
    }
    cb(null, true);
  }
}
