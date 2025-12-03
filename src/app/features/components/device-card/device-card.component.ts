import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Device } from '../../../core/models/models';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-device-card',
  imports: [CardModule, CommonModule, TableModule],
  templateUrl: './device-card.component.html',
  styles: ``,
})
export class DeviceCardComponent {
  device = input<Device>();
}
