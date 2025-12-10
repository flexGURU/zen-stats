import {
  Component,
  effect,
  inject,
  Input,
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
  @Input() deviceData: Device | null = null;
  mutationStatus = output<Record<string, boolean | string>>();
  statusOptions = signal([
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ]);
  loading = signal(false);

  private fb = inject(FormBuilder);
  private deviceService = inject(DeviceService);

  constructor() {
    this.initializeForm();
  }
  ngOnChanges() {
    const data = this.deviceData;
    if (data) {
      this.populateForm();
    } else {
      this.deviceForm.reset();
    }
  }

  initializeForm() {
    this.deviceForm = this.fb.group({
      name: ['', Validators.required],
      status: ['', Validators.required],
    });
  }
  populateForm() {
    if (this.deviceData) {
      this.deviceForm.patchValue({
        name: this.deviceData!.name,
        status: this.deviceData!.status ? 'active' : 'inactive',
      });
    } else {
      this.deviceForm.reset();
    }
  }

  get formControls() {
    return this.deviceForm.controls;
  }

  onSubmit() {
    if (this.deviceForm.invalid) return;

    let { name, status } = this.deviceForm.getRawValue();

    const devicePayload: Partial<Device> = {
      name,
      status: status === 'active',
    };

    this.loading.set(true);

    this.deviceData
      ? this.updateDevice(this.deviceData!.id, devicePayload)
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
    this.deviceService
      .updateDevice(deviceId, device)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
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
