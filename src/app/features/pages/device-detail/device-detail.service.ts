import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { catchError, Observable, map } from 'rxjs';
import {
  Device,
  DeviceDetail,
  DeviceSummary,
} from '../../../core/models/models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DeviceDetailService {
  private readonly apiUrl = environment.APIURL;

  private http = inject(HttpClient);

  getDeviceData = (deviceId: string | number): Observable<DeviceSummary[]> => {
    return this.http
      .get<{ data: DeviceSummary[] }>(
        `${this.apiUrl}/readings?device_id=${deviceId}`
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          throw new Error(`Error fetching device data: ${error.message}`);
        })
      );
  };

  getDeviceId(deviceId: string | number): Observable<Device> {
    return this.http
      .get<{ data: Device }>(`${this.apiUrl}/devices/${deviceId}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          throw new Error(`Error fetching device info: ${error.message}`);
        })
      );
  }
}
