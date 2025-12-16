import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap } from 'rxjs';
import { User } from '../../../core/models/models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = environment.APIURL;

  private http = inject(HttpClient);

  getUsers = (): Observable<User[]> => {
    return this.http.get<{ data: User[] }>(`${this.apiUrl}/users`).pipe(
      map((response) => response.data),
      catchError((error) => {
        throw new Error(`Error fetching users: ${error.message}`);
      })
    );
  };

  createUser = (user: User): Observable<User> => {
    return this.http.post<{ data: User }>(`${this.apiUrl}/users`, user).pipe(
      map((response) => response.data),
      catchError((error) => {
        throw new Error(`Error creating user: ${error.message}`);
      })
    );
  };

  updateUser = (id: string | number, user: User): Observable<User> => {
    return this.http
      .put<{ data: User }>(`${this.apiUrl}/users/${id}`, user)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          throw new Error(`Error updating user: ${error.message}`);
        })
      );
  };

  deleteUser = (id: string | number): Observable<void> => {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      catchError((error) => {
        throw new Error(`Error deleting user: ${error.message}`);
      })
    );
  };
}
