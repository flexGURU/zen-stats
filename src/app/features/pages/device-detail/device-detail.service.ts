import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, map } from 'rxjs';
import {
  Device,
  DeviceSummary,
} from '../../../core/models/models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DeviceDetailService {
  private apiUrl = import.meta.env.NG_APP_APIURL;

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

  exportData = (
    deviceId: string | number,
    start: Date,
    end: Date
  ): Observable<Blob> => {
    let payload = {
      deviceId: Number(deviceId),
      start: start.toISOString(),
      end: end.toISOString(),
    };

    return this.http
      .post(`${this.apiUrl}/reports/readings`, payload, {
        responseType: 'blob',
      })
      .pipe(
        catchError((error) => {
          console.error('Export error:', error);
          throw new Error(`Error exporting device data`);
        })
      );
  };
}
