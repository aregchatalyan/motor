import { map, tap } from 'rxjs/operators';
import { catchError, throwError } from 'rxjs';
import { CallHandler, ExecutionContext, HttpException, Injectable, Logger, NestInterceptor } from '@nestjs/common';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  // TODO 401 not processing
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const { method, originalUrl, params, query, body, ip } = req;

    const startTime = Date.now();

    return next.handle().pipe(
      map((responseBody) => responseBody),
      tap((responseBody) => {
        const duration = Date.now() - startTime;

        this.logger.debug(
          `🚀${ method } ${ originalUrl } ` +
          `🟢${ res.statusCode } ` +
          `⏱️${ duration }ms ` +
          `🌍IP: ${ ip } ` +
          `📥Req: ${ JSON.stringify({ params, query, body }) } ` +
          `📤Res: ${ JSON.stringify(responseBody) }`
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        let statusCode = 500;
        let errorMessage = 'Internal Server Error';

        if (error instanceof HttpException) {
          statusCode = error.getStatus();
          errorMessage = JSON.stringify(error.getResponse());
        }

        this.logger.error(
          `🚀${ method } ${ originalUrl } ` +
          `🟢${ statusCode } ` +
          `⏱️${ duration }ms ` +
          `🌍IP: ${ ip } ` +
          `📥Req: ${ JSON.stringify({ params, query, body }) } ` +
          `❌Error: ${ errorMessage }`
        );

        return throwError(() => error);
      })
    );
  }
}
