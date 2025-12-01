import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { ReactorModalComponent } from './reactor-modal/reactor-modal.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-reactor',
  imports: [
    TableModule,
    ButtonModule,
    Dialog,
    ReactorModalComponent,
    ToastModule,
    FormsModule,
    InputTextModule,
    ConfirmDialog,
  ],
  templateUrl: './reactor.component.html',
  providers: [ConfirmationService, MessageService],
})
export class ReactorComponent {
  displayModal = signal(false);
  isEditMode = signal(false);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  loading = signal(true);
  selectedReactor = signal<{ id: number; name: string; status: string } | null>(
    null
  );
  reactorName = signal('');

  reactors = [
    { id: 1, name: 'Reactor A', status: 'Active' },
    { id: 2, name: 'Reactor B', status: 'Inactive' },
    { id: 3, name: 'Reactor C', status: 'Maintenance' },
  ];

  editReactor = (reactor: { id: number; name: string; status: string }) => {
    this.selectedReactor.set(reactor);
    this.isEditMode.set(true);
    this.displayModal.set(true);
  };

  deleteReactor = (reactorId: number) => {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure you want to delete this reactor?',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
      },
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'You have accepted',
        });
      },
    });
  };
}
