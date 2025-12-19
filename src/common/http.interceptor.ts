import { map } from 'rxjs/operators';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        errors: null,
        data
      }))
    );
  }
}
