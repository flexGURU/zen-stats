import { Component, inject, input, output, signal } from '@angular/core';
import { User } from '../../../../core/models/models';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { UserService } from '../user.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-modal',
  imports: [
    InputTextModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SelectModule,
    CommonModule,
    TagModule,
    InputNumberModule,
  ],
  templateUrl: './user-modal.component.html',
  styles: ``,
})
export class UserModalComponent {
  userDataInput = signal<User | null>(null);
  userForm!: FormGroup;
  loading = signal(false);
  mutationStatus = output<Record<string, boolean | string>>();
  closeModal = output<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  constructor() {
    this.initiateForm();
  }

  roles = signal([
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ]);

  openModal = (userData: User | null) => {
    this.reset();
    if (userData) {
      this.userDataInput.set(userData);
      this.populateForm();
    } else {
      this.reset();
    }
  };

  initiateForm = () => {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.minLength(8)],
      role: ['', Validators.required],
      isActive: [true, Validators.required],
    });
  };

  get formControls() {
    return this.userForm.controls;
  }

  populateForm = () => {
    const userData = this.userDataInput();

    if (userData) {
      this.userForm.patchValue({
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        isActive: userData.isActive,
      });
    }
  };

  onSubmit = () => {
    if (this.userForm.invalid) return;
    const userPayload: User = this.userForm.getRawValue();
    console.log('raw', userPayload);

    this.loading.set(true);
    this.userDataInput()
      ? this.updateUser(userPayload)
      : this.triggerSubmit(userPayload);
  };

  triggerSubmit = (user: User) => {
    this.userService
      .createUser(user)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.mutationStatus.emit({
            status: true,
            detail: 'User created successfully',
          });
          this.reset();
        },
        error: (error) => {
          this.mutationStatus.emit({
            status: false,
            detail: `Error creating user: ${error.message}`,
          });
        },
      });
  };

  updateUser = (user: User) => {
    this.userService
      .updateUser(this.userDataInput()!.id, user)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.mutationStatus.emit({
            status: true,
            detail: 'User updated successfully',
          });
          this.reset();
        },
        error: (error) => {
          this.mutationStatus.emit({
            status: false,
            detail: `Error creating user`,
          });
        },
      });
  };

  deleteUser = () => {};
  private reset = () => {
    this.userForm.reset();
  };
}
