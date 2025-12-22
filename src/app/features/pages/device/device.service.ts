import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, catchError } from 'rxjs';
import { Device } from '../../../core/models/models';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private  apiUrl = import.meta.env.NG_APP_APIURL;

  private http = inject(HttpClient);
  getDevices = (): Observable<Device[]> => {
    return this.http.get<{ data: Device[] }>(`${this.apiUrl}/devices`).pipe(
      map((response) => response.data),
      catchError((err) => {
        throw new Error(`Error fetching devices: ${err.error.message}`);
      })
    );
  };

  createDevice = (device: Partial<Device>): Observable<Device> => {
    return this.http
      .post<{ data: Device }>(`${this.apiUrl}/devices`, device)
      .pipe(
        map((response) => response.data),
        catchError((err) => {
          console.error('Error creating device:', err);
          throw new Error(`Error creating device: ${err.error.message}`);
        })
      );
  };

  updateDevice = (
    deviceId: string | number,
    device: Partial<Device>
  ): Observable<Device> => {
    return this.http
      .put<{ data: Device }>(`${this.apiUrl}/devices/${deviceId}`, device)
      .pipe(
        map((response) => response.data),
        catchError((err) => {
          throw new Error(`Error updating device: ${err.error.message}`);
        })
      );
  };

  deleteDevice = (deviceId: string | number): Observable<void> => {
    return this.http.delete<void>(`${this.apiUrl}/devices/${deviceId}`).pipe(
      catchError((err) => {
        throw new Error(`Error deleting device: ${err.error.message}`);
      })
    );
  };
}
