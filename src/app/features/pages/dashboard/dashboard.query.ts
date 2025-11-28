import { inject } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

export function dashboardQuery() {
  const dashboardService = inject(DashboardService);

  const dashboardData = injectQuery(() => ({
    queryKey: ['dashboardData'],
    queryFn: () => lastValueFrom(dashboardService.getDevices()),
    staleTime: 1000 * 60 * 1,
  }));

  return dashboardData;
}
