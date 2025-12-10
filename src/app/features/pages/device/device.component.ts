import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DeviceCardComponent } from '../../components/device-card/device-card.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { dashboardQuery } from '../dashboard/dashboard.query';
import { deviceQuery } from './device.query';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { DeviceModalComponent } from './device-modal/device-modal.component';
import { Device } from '../../../core/models/models';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NotificationService } from '../../../core/services/notification.service';
import notificationResponse from '../../../core/utils/notification';
import { DeviceService } from './device.service';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-device',
  imports: [
    ProgressSpinnerModule,
    MessageModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    ButtonModule,
    TableModule,
    Dialog,
    DeviceModalComponent,
    Toast,
    ConfirmDialog,
    CommonModule,
    TagModule,
    FormsModule,
    InputTextModule,
  ],
  templateUrl: './device.component.html',
  providers: [MessageService, ConfirmationService],
})
export class DeviceComponent {
  devices = deviceQuery();
  selectedDevice = signal<Device | null>(null);
  displayModal = signal(false);
  deleteLoading = signal(false);
  handleResponse = notificationResponse;

  deviceName = signal('');
  status = signal<'active' | 'inactive' | ''>('');

  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private deleteDeviceService = inject(DeviceService).deleteDevice;

  constructor() {
    effect(() => {
      if (!this.displayModal()) {
        this.selectedDevice.set(null);
      }
    });
  }

  editDevice(device: Device) {
    this.selectedDevice.set(device);
    this.displayModal.set(true);
  }

  deleteDevice(deviceId: string) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure you want to delete this device?',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
        loading: this.deleteLoading(),
      },
      accept: () => {
        this.deleteDeviceService(deviceId)
          .pipe(finalize(() => this.deleteLoading.set(false)))
          .subscribe({
            next: () => {
              this.handleSuccess('Device deleted successfully');
            },
            error: (error) => {
              this.handleError('Error deleting device');
            },
          });
      },
    });
  }

  onCreateDevice(event: Record<string, boolean | string>) {
    event['status'] ? this.handleSuccess(event['detail']) : this.handleError();
  }

  handleSuccess(detail: string | boolean) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: detail as string,
    });

    this.displayModal.set(false);
    this.devices.refetch();
  }
  handleError(detail: string | boolean = false) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detail ? (detail as string) : 'Error creating device',
    });
  }

  applyFilters() {}

  clearFilters() {
    this.deviceName.set('');
    this.status.set('');
  }
}
