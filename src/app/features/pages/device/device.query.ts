import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { DeviceService } from './device.service';

export function deviceQuery() {
  const deviceService = inject(DeviceService);

  const deviceData = injectQuery(() => ({
    queryKey: ['deviceData'],
    queryFn: () => lastValueFrom(deviceService.getDevices()),
    staleTime: 1000 * 60 * 1,
  }));

  return deviceData;
}
