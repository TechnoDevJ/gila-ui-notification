import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError: ApiError = {
        timestamp: new Date().toISOString(),
        status: error.status,
        error: error.statusText || 'Unknown Error',
        message: error.error?.message || error.message || 'An unexpected error occurred',
        path: req.url,
      };
      return throwError(() => apiError);
    })
  );
};
