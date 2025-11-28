import { Component, effect } from '@angular/core';
import { DeviceCardComponent } from '../../components/device-card/device-card.component';
import { RouterLink } from '@angular/router';
import { dashboardQuery } from './dashboard.query';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    DeviceCardComponent,
    RouterLink,
    ProgressSpinnerModule,
    MessageModule,
    ButtonModule,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styles: ``,
})
export class DashboardComponent {
  devices = dashboardQuery();

  constructor() {}
}
