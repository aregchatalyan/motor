import { Request, Response } from 'express';
import { map, tap } from 'rxjs/operators';
import { catchError, throwError } from 'rxjs';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const startTime = Date.now();

    const info = {
      url: req.originalUrl,
      method: req.method,
      params: req.params,
      query: req.query,
      body: req.body,
      ip: req.ip,
      statusCode: res.statusCode
    }

    return next.handle().pipe(
      map((data) => data),
      tap((data) => {
        this.logger.debug(JSON.stringify({
          ...info,
          data,
          duration: `${ Date.now() - startTime }ms`
        }, null, 2));
      }),
      catchError((err) => {
        this.logger.error(JSON.stringify({
          ...info,
          error: err.getResponse(),
          duration: `${ Date.now() - startTime }ms`
        }, null, 2));

        return throwError(() => err);
      })
    );
  }
}
