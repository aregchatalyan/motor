import { Request } from 'express';
import { createParamDecorator } from '@nestjs/common';
import { JwtPayload } from './guards/types';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload, context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;

    return data ? user[data] : user;
  }
);
