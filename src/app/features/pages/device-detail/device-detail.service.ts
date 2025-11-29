import { computed, inject, Injectable, signal } from '@angular/core';
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

  date = signal('');
  startTime = signal('');
  endTime = signal('');
  list_by = signal('');

  baseApiUrl = computed(() => {
    const params = new URLSearchParams();

    if (this.date()) params.set('list_by', 'timeslot');

    if (this.date()) params.set('date', this.date().toString());
    if (this.startTime()) params.set('start', this.startTime().toString());
    if (this.endTime()) params.set('end', this.endTime().toString());

    return `${this.apiUrl}/readings?${params.toString()}`;
  });

  getDeviceData = (deviceId: string | number): Observable<DeviceSummary[]> => {
    return this.http
      .get<{ data: DeviceSummary[] }>(
        `${this.baseApiUrl()}&device_id=${deviceId}`
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
