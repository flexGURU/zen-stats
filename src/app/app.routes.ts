import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    component: MainLayoutComponent,
    loadChildren: () => import('./features/routes').then((m) => m.routes),
  },
];
