import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './auth.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    PasswordModule,
    ReactiveFormsModule,
    ButtonModule,
    MessageModule,
    ToastModule,
    InputText,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styles: ``,
  providers: [MessageService],
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = signal(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  constructor() {
    this.initialiseForm();
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  initialiseForm = () => {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  };

  get formControls() {
    return this.loginForm.controls;
  }

  login() {
    if (this.loginForm.invalid) return;

    let { email, password } = this.loginForm.getRawValue();
    this.loading.set(true);

    this.authService
      .login(email, password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: 'Welcome back!',
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: error.message || 'An error occurred during login.',
          });
        },
      });
  }
}
