import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'device/:deviceId',
    loadComponent: () =>
      import('./pages/device-detail/device-detail.component').then(
        (m) => m.DeviceDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'reactors',
    loadComponent: () =>
      import('./pages/reactor/reactor.component').then(
        (m) => m.ReactorComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'batch-experiments',
    loadComponent: () =>
      import('./pages/batch-experiment/batch-experiment.component').then(
        (m) => m.BatchExperimentComponent
      ),
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: 'dashboard' },
];
