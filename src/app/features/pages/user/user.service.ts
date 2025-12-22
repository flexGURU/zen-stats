import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap } from 'rxjs';
import { User } from '../../../core/models/models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = import.meta.env.NG_APP_APIURL;

  private http = inject(HttpClient);

  getUsers = (): Observable<User[]> => {
    return this.http.get<{ data: User[] }>(`${this.apiUrl}/users`).pipe(
      map((response) => response.data),
      catchError((error) => {
        console.error('Error fetching users:', error);
        throw new Error(`Error fetching users: ${error.error.message}`);
      })
    );
  };

  createUser = (user: User): Observable<User> => {
    return this.http.post<{ data: User }>(`${this.apiUrl}/users`, user).pipe(
      map((response) => response.data),
      catchError((error) => {
        console.error('Error creating user:', error);
        throw new Error(`Error creating user: ${error.error.message}`);
      })
    );
  };

  updateUser = (id: string | number, user: Partial<User>): Observable<User> => {
    return this.http
      .put<{ data: User }>(`${this.apiUrl}/users/${id}`, user)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error updating user:', error);
          throw new Error(`Error updating user: ${error.error.message}`);
        })
      );
  };

  deleteUser = (id: string | number): Observable<void> => {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting user:', error);
        throw new Error(`Error deleting user: ${error.error.message}`);
      })
    );
  };
}
