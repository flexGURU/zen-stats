import { inject } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

export function dashboardQuery() {
  const dashboardService = inject(DashboardService);

  const dashboardStats = injectQuery(() => ({
    queryKey: ['dashboardStats'],
    queryFn: () => lastValueFrom(dashboardService.getDashboardStats()),
    staleTime: 5 * 60 * 1000,
  }));

  return {
    dashboardStats,
  };
}
