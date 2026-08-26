import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ApiService } from '../services/api.service';
import { TokenService } from '../services/token.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const apiService = inject(ApiService);
  const tokenService = inject(TokenService);

  const authHeader = tokenService.getAuthHeader();

  let clonedReq = req;
  // Do not override authorization on refresh endpoint because it sends the refresh token header
  if (authHeader && !req.url.includes('/api/user/refresh')) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: authHeader,
      },
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint =
        req.url.includes('/api/user/signin') ||
        req.url.includes('/api/user/signup') ||
        req.url.includes('/api/user/refresh');

      // Attempt automatic refresh on 401 for authenticated endpoints
      if (error.status === 401 && !isAuthEndpoint) {
        const refreshToken = tokenService.getRefreshToken();

        if (refreshToken) {
          if (!isRefreshing) {
            isRefreshing = true;
            refreshTokenSubject.next(null);

            return apiService.refreshToken().pipe(
              switchMap((res: any) => {
                isRefreshing = false;
                const newAccessToken = res?.accessToken || res?.data?.accessToken;
                if (newAccessToken) {
                  tokenService.setAccessToken(newAccessToken);
                  refreshTokenSubject.next(newAccessToken);

                  const retriedReq = req.clone({
                    setHeaders: {
                      Authorization: `${tokenService.getRole()} ${newAccessToken}`,
                    },
                  });
                  return next(retriedReq);
                }

                // If refresh response didn't contain access token
                tokenService.clear();
                refreshTokenSubject.next(null);
                toastService.error('Session expired. Please sign in again.', 'Auth Expired');
                return throwError(() => error);
              }),
              catchError((refreshErr) => {
                isRefreshing = false;
                tokenService.clear();
                refreshTokenSubject.next(null);
                toastService.error('Session expired. Please sign in again.', 'Auth Expired');
                return throwError(() => refreshErr);
              })
            );
          } else {
            // Another request is already refreshing the token. Queue and wait for the new access token.
            return refreshTokenSubject.pipe(
              filter((token): token is string => token !== null),
              take(1),
              switchMap((newToken) => {
                const retriedReq = req.clone({
                  setHeaders: {
                    Authorization: `${tokenService.getRole()} ${newToken}`,
                  },
                });
                return next(retriedReq);
              })
            );
          }
        }
      }

      // If not handled by refresh, only show errors for legitimate failures
      if (error.status === 401) {
        if (!req.url.includes('/api/user/profile') && !req.url.includes('/api/user/signin') && !req.url.includes('/api/user/refresh')) {
          toastService.error('Session expired or unauthorized. Please sign in.', 'Auth Error');
        }
      } else if (error.status === 403) {
        toastService.error('You do not have permission to perform this action.', 'Access Denied');
      } else if (error.status === 400 && error.error?.errors) {
        const firstErr = Object.values(error.error.errors)[0] as string[] | undefined;
        if (firstErr && firstErr.length > 0) {
          toastService.error(firstErr[0], 'Validation Error');
        } else {
          toastService.error(error.error?.message || 'Bad Request', 'Error');
        }
      } else if (error.status >= 500) {
        toastService.error('Server encountered an error. Please try again later.', 'Server Error');
      }
      return throwError(() => error);
    })
  );
};
