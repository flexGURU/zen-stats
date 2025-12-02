import { Component, effect, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { ReactorModalComponent } from './reactor-modal/reactor-modal.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Reactor } from '../../../core/models/models';

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
  selectedReactor = signal<Reactor | null>(null);
  reactorName = signal('');

  constructor() {
    effect(() => {
      if (!this.displayModal()) {
        this.selectedReactor.set(null);
      }
    });
  }

  reactors: Reactor[] = [
    {
      id: 1,
      name: 'Reactor A',
      status: 'Active',
      pdfUrl: 'http://example.com/reactorA.pdf',
      pathway: 'Gaseous',
    },
    {
      id: 2,
      name: 'Reactor B',
      status: 'Inactive',
      pdfUrl: 'http://example.com/reactorB.pdf',
      pathway: 'Liquid',
    },
  ];

  editReactor = (reactor: Reactor) => {
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
