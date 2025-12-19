import { Request } from 'express';
import { map, tap } from 'rxjs/operators';
import { catchError, throwError } from 'rxjs';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler) {
    const { url, method, params, query, body, ip } = context.switchToHttp().getRequest<Request>();

    const startTime = Date.now();

    const req = { url, method, params, query, body, ip }

    return next.handle().pipe(
      map((data) => data),
      tap((data) => {
        this.logger.debug({
          req,
          data,
          duration: `${ Date.now() - startTime }ms`
        });
      }),
      catchError((err) => {
        this.logger.error({
          req,
          error: err.getResponse(),
          duration: `${ Date.now() - startTime }ms`
        });

        return throwError(() => err);
      })
    );
  }
}
