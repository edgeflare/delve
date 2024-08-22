import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError, timer } from 'rxjs';

/**
 * Options for configuring the `httpErrorInterceptor`.
 */
export interface HttpErrorInterceptorOptions {
  /**
   * The number of times to retry failed HTTP requests before throwing an error.
   * Defaults to 3.
   */
  retryCount?: number;
}

/**
 * An HTTP interceptor that retries failed requests with exponential backoff.
 *
 * @param {HttpErrorInterceptorOptions} [options] - Optional configuration options.
 * @returns {HttpInterceptorFn} - An HTTP interceptor function.
 */
export const httpErrorInterceptor = ({ retryCount = 3 }: HttpErrorInterceptorOptions = {}): HttpInterceptorFn => {
  return (req, next) =>
    next(req).pipe(
      retry({
        count: retryCount,
        delay: (_, count) => timer(count * 1000), /** Exponential backoff delay */
      }),
      catchError((err: HttpErrorResponse) => {
        /** Re-throw the error for handler */
        return throwError(() => err);
      })
    );
};
