import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Device } from '../../../core/models/models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = environment.APIURL;

  private http = inject(HttpClient);

  getDevices(): Observable<Device[]> {
    return this.http.get<{ data: Device[] }>(`${this.apiUrl}/devices`).pipe(
      map((response) => response.data),
      catchError((err) => {
        throw new Error(err);
      })
    );
  }
}
