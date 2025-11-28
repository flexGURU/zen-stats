import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Device } from '../../../core/models/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-device-card',
  imports: [CardModule, CommonModule],
  templateUrl: './device-card.component.html',
  styles: ``,
})
export class DeviceCardComponent {
  device = input<Device>();
}
