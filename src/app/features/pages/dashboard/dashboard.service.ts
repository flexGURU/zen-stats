import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = import.meta.env.NG_APP_APIURL;

  private http = inject(HttpClient);

  getDashboardStats = (): Observable<Record<string, number>> => {
    return this.http
      .get<{ data: Record<string, number> }>(`${this.apiUrl}/dashboard/stats`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error fetching dashboard stats:', error);
          throw new Error('Failed to fetch dashboard stats');
        })
      );
  };
}
