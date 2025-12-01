import { Routes } from '@angular/router';

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
  },
  {
    path: 'device/:deviceId',
    loadComponent: () =>
      import('./pages/device-detail/device-detail.component').then(
        (m) => m.DeviceDetailComponent
      ),
  },
  {
    path: 'reactors',
    loadComponent: () =>
      import('./pages/reactor/reactor.component').then(
        (m) => m.ReactorComponent
      ),
  },
  {
    path: 'batch-experiments',
    loadComponent: () =>
      import('./pages/batch-experiment/batch-experiment.component').then(
        (m) => m.BatchExperimentComponent
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
