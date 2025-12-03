import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
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
  private readonly apiUrl = environment.APIURL;
  private readonly SESSIONKEY = 'zen_session';
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
  }

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
          this.router.navigate(['/']);
        }),
        catchError((error) => {
          console.error('Login error:', error);
          throw new Error('Invalid Email or Password');
        })
      );
  };

  set jwtToken(token: string) {
    sessionStorage.setItem(this.SESSIONKEY, token);
  }

  get jwtToken(): string {
    return sessionStorage.getItem(this.SESSIONKEY) || '';
  }

  restoreSession() {
    const token = this.jwtToken;
    if (token) {
      this._state.update((state) => ({
        ...state,
        isAuthenticated: true,
        token: token,
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
        this.router.navigate(['/login']);
      })
    );
  };
}
