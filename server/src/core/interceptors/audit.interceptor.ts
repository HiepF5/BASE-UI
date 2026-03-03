import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - now;
        this.logger.log(
          JSON.stringify({
            method,
            url,
            userId: user?.id || 'anonymous',
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          }),
        );
      }),
    );
  }
}
