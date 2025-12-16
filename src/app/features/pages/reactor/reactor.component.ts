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
import { reactorQuery } from './reactor.query';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Message } from 'primeng/message';
import { Chip } from 'primeng/chip';
import { CommonModule } from '@angular/common';
import { ReactorService } from './reactor.service';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { pathwayOptions, statusOptions } from '../../../core/utils/options';

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
    Message,
    CommonModule,
    TagModule,
    SelectModule,
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
  status = signal('');
  pathway = signal('');
  statusOptions = signal(statusOptions);
  pathwayOptions = signal(pathwayOptions);

  reactors = reactorQuery().reactorData;

  private reactorService = inject(ReactorService);

  constructor() {
    effect(() => {
      if (!this.displayModal()) {
        this.selectedReactor.set(null);
      }
    });

    effect(() => {
      this.applyFilters();
    });
  }

  applyFilters() {
    this.reactorService.search.set(this.reactorName());
    this.reactorService.status.set(this.status());
    this.reactorService.pathway.set(this.pathway());
  }

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
        this.triggerDelete(reactorId);
      },
    });
  };

  triggerDelete(reactorId: number | string) {
    this.reactorService.deleteReactor(reactorId).subscribe({
      next: () => {
        this.handleSuccess('Reactor deleted successfully');
      },
      error: (error) => {
        this.handleError(error.message);
      },
    });
  }

  onMutateReactor(event: Record<string, boolean | string>) {
    event['status']
      ? this.handleSuccess(event['detail'])
      : this.handleError(event['detail']);
  }

  handleSuccess(detail: string | boolean) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: detail as string,
    });

    this.displayModal.set(false);
    this.reactors.refetch();
  }
  handleError(detail: string | boolean = false) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detail ? (detail as string) : 'Error creating reactor',
    });
  }

  clearFilters() {
    this.reactorService.search.set('');
    this.reactorService.status.set('');
    this.reactorService.pathway.set('');
    this.reactorName.set('');
    this.status.set('');
    this.pathway.set('');
    this.reactors.refetch();
  }
}
