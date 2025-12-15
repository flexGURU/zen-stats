import { Component, effect } from '@angular/core';
import { DeviceCardComponent } from '../../components/device-card/device-card.component';
import { RouterLink } from '@angular/router';
import { dashboardQuery } from './dashboard.query';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    MessageModule,
    ButtonModule,
    RouterLink,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styles: ``,
})
export class DashboardComponent {
  dashboardStats = dashboardQuery().dashboardStats;

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  getDeviceUtilization(): number {
    const total = this.dashboardStats.data()?.['totalDevices'] ?? 0;
    return total > 0
      ? ((this.dashboardStats.data()?.['activeDevices'] ?? 0) / total) * 100
      : 0;
  }

  getReactorUtilization(): number {
    const total = this.dashboardStats.data()?.['totalReactors'] ?? 0;
    return total > 0
      ? ((this.dashboardStats.data()?.['activeReactors'] ?? 0) / total) * 100
      : 0;
  }

  getUserActivity(): number {
    const total = this.dashboardStats.data()?.['totalUsers'] ?? 0;
    return total > 0
      ? ((this.dashboardStats.data()?.['activeUsers'] ?? 0) / total) * 100
      : 0;
  }
}
