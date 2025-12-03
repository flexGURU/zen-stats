import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Device } from '../../../../core/models/models';
import { ButtonModule } from 'primeng/button';
import { DeviceService } from '../device.service';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-device-modal',
  imports: [ButtonModule, FormsModule, ReactiveFormsModule, SelectModule],
  templateUrl: './device-modal.component.html',
  styles: ``,
})
export class DeviceModalComponent {
  deviceForm!: FormGroup;
  deviceData = input<Device | null>(null);
  mutationStatus = output<Record<string, boolean | string>>();
  statusOptions = signal([
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ]);
  loading = signal(false);

  private fb = inject(FormBuilder);
  private deviceService = inject(DeviceService);

  constructor() {
    this.initiliaseForm();
    effect(() => {
      this.deviceData() ? this.populateForm() : this.initiliaseForm();
    });
  }

  initiliaseForm() {
    this.deviceForm = this.fb.group({
      name: ['', Validators.required],
      status: [null, Validators.required],
    });
  }
  populateForm() {
    this.deviceForm.patchValue({
      name: this.deviceData()?.name,
      status: this.deviceData()?.status,
    });
  }

  get formControls() {
    return this.deviceForm.controls;
  }

  onSubmit() {
    if (this.deviceForm.invalid) return;

    let { name, status } = this.deviceForm.getRawValue();

    const devicePayload: Partial<Device> = {
      name,
      status,
    };

    this.loading.set(true);

    this.deviceData()
      ? this.updateDevice(this.deviceData()!.id, devicePayload)
      : this.createDevice(devicePayload);
  }

  createDevice(device: Partial<Device>) {
    this.deviceService
      .createDevice(device)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.mutationStatus.emit({
            status: true,
            detail: 'Device created successfully',
          });
        },
        error: (error) => {
          console.error('Error creating device:', error);
          this.mutationStatus.emit({
            status: false,
            detail: 'Error creating device',
          });
        },
      });
  }
  updateDevice(deviceId: string | number, device: Partial<Device>) {
    this.deviceService.updateDevice(deviceId, device).subscribe({
      next: () => {
        this.mutationStatus.emit({
          status: true,
          detail: 'Device updated successfully',
        });
      },
      error: (error) => {
        console.error('Error updating device:', error);
        this.mutationStatus.emit({
          status: false,
          detail: 'Error updating device',
        });
      },
    });
  }
}
