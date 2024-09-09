import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError, from } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const asyncHandler = next.handle();
    return asyncHandler.pipe(
      catchError(error => {
        // Handle the error here, you can log it or modify it as needed
        console.log('interceptor error', { error });
        // Rethrow the error to propagate it further
        return throwError(error);
      }),
    );
  }
}
