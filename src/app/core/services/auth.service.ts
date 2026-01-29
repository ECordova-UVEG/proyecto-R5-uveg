import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private _isLoggedIn = new BehaviorSubject<boolean>(false);

  get isLoggedIn$(): Observable<boolean> {
    return this._isLoggedIn.asObservable();
  }

  constructor() {
    // Check for a token on service initialization to recover session
    if (typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
      this._isLoggedIn.next(true);
    }
  }

  /**
   * Checks if the user is currently authenticated.
   * @returns `true` if the user is logged in, `false` otherwise.
   */
  isAuthenticated(): boolean {
    return this._isLoggedIn.getValue();
  }

  /**
   * Attempts to log the user in with the provided credentials.
   * Simulates an API call and stores a session token on success.
   * @param credentials An object containing the username and password.
   * @returns An Observable that emits `true` on successful login, or an error on failure.
   */
  login(credentials: { user: string, pass: string }): Observable<boolean> {
    // Simulate a backend API call
    return of(true).pipe(
      delay(1500),
      tap(() => {
        if (credentials.user === 'admin' && credentials.pass === 'admin123') {
          // On successful validation, store a dummy token and update state
          localStorage.setItem('token', 'dummy-auth-token-xyz');
          this._isLoggedIn.next(true);
        } else {
          // If validation fails, throw an error to be caught by the component
          throw new Error('Invalid credentials');
        }
      }),
      catchError((error) => {
        // Ensure the subject remains false on error and propagate the error
        this._isLoggedIn.next(false);
        return throwError(() => new Error(error.message));
      })
    );
  }

  /**
   * Logs the user out by clearing the session token and navigates to the login page.
   */
  logout(): void {
    // Clear session data and update state
    localStorage.removeItem('token');
    this._isLoggedIn.next(false);
    this.router.navigate(['/login']);
  }
}