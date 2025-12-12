import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { Reactor } from '../../../core/models/models';

@Injectable({
  providedIn: 'root',
})
export class ReactorService {
  private readonly apiUrl = environment.APIURL;
  private http = inject(HttpClient);

  search = signal('');
  status = signal('');
  pathway = signal('');

  constructor() {
    effect(() => {
      console.log('base', this.baseApiUrl());
    });
  }

  baseApiUrl = computed(() => {
    const params = new URLSearchParams();

    if (this.search()) params.set('search', this.search());
    if (this.status()) params.set('status', this.status());
    if (this.pathway()) params.set('pathway', this.pathway());

    return `${this.apiUrl}/reactors?${params.toString()}`;
  });

  getReactors = (): Observable<Reactor[]> => {
    return this.http.get<{ data: Reactor[] }>(`${this.baseApiUrl()}`).pipe(
      map((response) => response.data),
      catchError((error) => {
        console.error(error);
        throw new Error('Error fetching reactors');
      })
    );
  };

  createReactor = (reactor: Reactor): Observable<Reactor> => {
    return this.http
      .post<{ data: Reactor }>(`${this.apiUrl}/reactors`, reactor)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error(error);
          throw new Error('Error creating reactor');
        })
      );
  };

  updateReactor = (
    reactorId: string | number,
    reactor: Partial<Reactor>
  ): Observable<Reactor> => {
    return this.http
      .put<{ data: Reactor }>(`${this.apiUrl}/reactors/${reactorId}`, reactor)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error(error);
          throw new Error('Error updating reactor');
        })
      );
  };
  deleteReactor = (reactorId: string | number): Observable<void> => {
    return this.http.delete<void>(`${this.apiUrl}/reactors/${reactorId}`).pipe(
      catchError((error) => {
        console.error(error);
        throw new Error('Error deleting reactor');
      })
    );
  };
}
