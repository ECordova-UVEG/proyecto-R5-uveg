import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../services/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // IGNORAR errores de la API de Finanzas (se manejan en el servicio con datos simulados)
      if (req.url.includes('financialmodelingprep.com')) {
        // Pasamos el error al servicio sin mostrar alerta global
        return throwError(() => error);
      }

      let errorMessage = 'An unknown error occurred!';
      if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
        authService.logout();
      } else if (error.status === 500) {
        errorMessage = 'A server error occurred. Please try again later.';
      }
      
      toastService.show(errorMessage, 'error');
      return throwError(() => error);
    })
  );
};