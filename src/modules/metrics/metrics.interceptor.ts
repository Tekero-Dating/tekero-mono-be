import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor (
    @InjectMetric("http_request_duration_seconds") public req_duration: Gauge<string>,
    @InjectMetric("http_requests_total") public req_total: Counter<string>
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const endpoint = request.route?.path || request.url; // Use route path if available
        const method = request.method;
        const statusCode = response.statusCode;

        // Callback function for custom logic
        this.onRequestComplete(endpoint, method, duration, statusCode);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const endpoint = request.route?.path || request.url; // Use route path if available
        const method = request.method;

        // Determine status code from error or default to 500
        const statusCode = error.status || 500;

        this.onRequestComplete(endpoint, method, duration, statusCode);

        throw error; // Re-throw the error to let Nest handle it
      }),
    );
  }

  private onRequestComplete(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
  ): void {
    // Callback logic here
    console.log({ endpoint, method, duration, statusCode });
    this.req_duration.set({ endpoint, method, status: statusCode }, duration);
    this.req_total.inc({ endpoint, method, status: statusCode }, 1);
  }
}
