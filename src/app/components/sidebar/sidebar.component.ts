import { CommonModule } from '@angular/common';
import { Component, inject, model, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { AuthService } from '../../features/pages/login/auth.service';
import { finalize } from 'rxjs';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-sidebar',
  imports: [
    DrawerModule,
    ButtonModule,
    RouterLink,
    CommonModule,
    RouterLinkActive,
    Ripple,
  ],
  templateUrl: './sidebar.component.html',
  styles: ``,
})
export class SidebarComponent {
  visible = model(false);
  loading = signal(false);

  sidebarContent = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Device', icon: 'pi pi-tablet', route: '/devices' },
    { label: 'Reactor', icon: 'pi pi-cog', route: '/reactors' },
    {
      label: 'Batch Experiment',
      icon: 'pi pi-sliders-h',
      route: '/batch-experiments',
    },
  ];

  sidebarLinks = signal(this.sidebarContent);
  private logout = inject(AuthService).logout;
  logOut() {
    this.loading.set(true);
    this.logout()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Logout failed', err);
        },
      });
  }
}
