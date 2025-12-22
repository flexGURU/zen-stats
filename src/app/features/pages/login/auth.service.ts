import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, tap } from 'rxjs';
import { LoginResponse, User } from '../../../core/models/models';
import { Router } from '@angular/router';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = import.meta.env.NG_APP_APIURL;
  private readonly SESSIONKEY = 'zen_session';
  private readonly USERKEY = 'zen_user';

  private _state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });

  isLoggedIn = computed(() => this._state().isAuthenticated);
  currentUser = computed(() => this._state().user);
  currentToken = computed(() => this._state().token);

  constructor() {
    this.restoreSession();
    effect(() => {});
  }

  set jwtToken(token: string) {
    sessionStorage.setItem(this.SESSIONKEY, token);
  }

  get jwtToken(): string {
    return sessionStorage.getItem(this.SESSIONKEY) || '';
  }

  set jwtUser(user: User) {
    sessionStorage.setItem(this.USERKEY, JSON.stringify(user));
  }

  get jwtUser(): User | null {
    const userData = sessionStorage.getItem(this.USERKEY);
    return userData ? JSON.parse(userData) : null;
  }

  hasRole = (role: string): boolean => {
    const currentRole = this.currentUser()?.role;

    return currentRole ? currentRole === role : false;
  };

  login = (email: string, password: string) => {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          this._state.set({
            user: response.user,
            isAuthenticated: true,
            token: response.access_token,
          });
          this.jwtToken = response.access_token;
          this.jwtUser = response.user;
          this.router.navigate(['/']);
        }),
        catchError((error) => {
          console.error('Login error:', error);
          throw new Error('Invalid Email or Password');
        })
      );
  };

  restoreSession() {
    const token = this.jwtToken;
    const user: User | null = this.jwtUser;
    if (token) {
      this._state.update((state) => ({
        ...state,
        isAuthenticated: true,
        token: token,
        user: user,
      }));
    }
  }

  logout = () => {
    return this.http.get(`${this.apiUrl}/logout`).pipe(
      tap(() => {
        this._state.set({
          user: null,
          isAuthenticated: false,
          token: null,
        });
        sessionStorage.removeItem(this.SESSIONKEY);
        window.location.href = '/login';
      })
    );
  };

  resetPassword = (email: string): Observable<string> => {
    return this.http
      .post<{ data: string }>(`${this.apiUrl}/request-password-reset`, {
        email,
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Reset Password error:', error);
          let errorMessage = `${error.error.message}. An error occurred during password reset.`;
          throw new Error(errorMessage);
        })
      );
  };
}
