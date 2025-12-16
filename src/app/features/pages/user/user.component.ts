import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ReactorModalComponent } from '../reactor/reactor-modal/reactor-modal.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserModalComponent } from './user-modal/user-modal.component';
import { userQuery } from './user.query';
import { User } from '../../../core/models/models';
import { UserService } from './user.service';

@Component({
  selector: 'app-user',
  imports: [
    TableModule,
    ButtonModule,
    Dialog,
    ToastModule,
    FormsModule,
    InputTextModule,
    ConfirmDialog,
    Message,
    CommonModule,
    TagModule,
    SelectModule,
    UserModalComponent,
  ],
  templateUrl: './user.component.html',
  styles: ``,
  providers: [ConfirmationService, MessageService],
})
export class UserComponent {
  @ViewChild('userModal') userModal!: UserModalComponent;
  users = userQuery().userData;
  displayModal = signal(false);
  isEdit = signal(false);
  selectedUser = signal<User | null>(null);

  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private userService = inject(UserService);

  constructor() {
    effect(() => {
      if (!this.displayModal()) {
        this.isEdit.set(false);
      }
    });
  }

  mutateUser(user: User | null) {
    if (user) {
      this.isEdit.set(true);
      this.userModal.openModal(user);
      this.displayModal.set(true);
    } else {
      this.isEdit.set(false);
      this.displayModal.set(true);
      this.userModal.openModal(null);
    }
  }

  deleteUser(userId: string | number) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user ?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.triggerDeleteUser(userId);
      },
    });
  }
  triggerDeleteUser(userId: string | number) {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User deleted successfully',
        });
        this.users.refetch();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error deleting user: ${error.message}`,
        });
      },
    });
  }
  clearFilters() {}

  onMutationStatus = (event: Record<string, boolean | string>) => {
    event['status']
      ? this.handleSuccess(event['detail'])
      : this.handleError(event['detail']);
  };

  handleSuccess(detail: string | boolean) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: detail as string,
    });

    this.displayModal.set(false);
    this.users.refetch();
  }

  handleError(detail: string | boolean = false) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detail ? (detail as string) : 'Error creating experiment',
    });
  }
}
