import { inject, Signal } from '@angular/core';
import { DeviceDetailService } from './device-detail.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

export const deviceDetailQuery = (deviceId: Signal<string | number>) => {
  const deviceDetailService = inject(DeviceDetailService);

  const deviceDataQuery = injectQuery(() => ({
    queryKey: ['deviceData', deviceId()],
    queryFn: () => lastValueFrom(deviceDetailService.getDeviceData(deviceId())),
    staleTime: 1000 * 60 * 1,
  }));

  return deviceDataQuery;
};
