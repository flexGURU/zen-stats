import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { BatchExperimentModalComponent } from './batch-experiment-modal/batch-experiment-modal.component';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { batchExperimentQuery } from './batch-experiment.query';
import { BatchExperiment } from '../../../core/models/models';
import { BatchExperimentService } from './batch-experiment.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-batch-experiment',
  imports: [
    TableModule,
    ButtonModule,
    Dialog,
    BatchExperimentModalComponent,
    Toast,
    ConfirmDialog,
    InputTextModule,
    DatePicker,
    FormsModule,
    CommonModule,
    DatePickerModule,
    PaginatorModule,
  ],
  templateUrl: './batch-experiment.component.html',
  providers: [ConfirmationService, MessageService],
})
export class BatchExperimentComponent {
  @ViewChild('batchExperimentModal')
  batchExperimentModal!: BatchExperimentModalComponent;

  displayModal = signal(false);
  isEditMode = signal(false);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  datePlacehHolder = new Date();
  todaysDate = this.datePlacehHolder.toLocaleDateString();
  selectedExperiment = signal<BatchExperiment | null>(null);

  searchTerm = signal('');
  date = signal<Date | null>(null);

  private batchExperimentService = inject(BatchExperimentService);
  pageSize = this.batchExperimentService.pageSize;
  totalRecords = this.batchExperimentService.total;
  first = signal(0);

  batchExperiments = batchExperimentQuery().batchExperimentData;

  constructor() {
    effect(() => {
      if (!this.displayModal()) {
        this.selectedExperiment.set(null);
      }
    });
    effect(() => {
      this.applyFilters();
    });
  }

  onPageChange(event: PaginatorState) {
    this.batchExperimentService.limit.set(event.rows ?? 10);
    this.batchExperimentService.page.set((event.page ?? 0) + 1);
    this.first.set(event.first ?? 0);
  }

  editBatchExperiment = (experiment: BatchExperiment | null) => {
    if (experiment) {
      this.batchExperimentModal.openModal(experiment);
      this.isEditMode.set(true);
      this.selectedExperiment.set(experiment);
      this.displayModal.set(true);
    } else {
      this.batchExperimentModal.openModal(null);
      this.displayModal.set(true);
    }
  };

  createBatchExperiment = () => {
    this.isEditMode.set(false);
    this.displayModal.set(true);
  };
  applyFilters() {
    this.batchExperimentService.search.set(this.searchTerm());

    const date = this.date();
    if (date) {
      this.batchExperimentService.date.set(this.formatDate(date));
    } else {
      this.batchExperimentService.date.set(null);
    }
  }

  private formatDate(date: Date): Date {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const formatted = `${year}-${month}-${day}`;

    let formattedDate = new Date(formatted);

    return formattedDate;
  }
  clearFilters() {
    this.batchExperimentService.search.set('');
    this.batchExperimentService.date.set(null);
    this.searchTerm.set('');
    this.date.set(null);
    this.batchExperiments.refetch();
    this.first.set(0);
    this.batchExperimentService.page.set(1);
    this.batchExperimentService.limit.set(10);
  }

  deleteBatchExperiment = (experimentId: number) => {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure you want to delete this experiment?',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
      },
      accept: () => {
        this.triggerDelete(experimentId);
      },
    });
  };

  triggerDelete(experimentId: number | string) {
    this.batchExperimentService.deleteBatchExperiment(experimentId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Experiment deleted successfully',
        });
        this.batchExperiments.refetch();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete experiment',
        });
      },
    });
  }

  onMutateExperiment(event: Record<string, boolean | string>) {
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
    this.batchExperiments.refetch();
  }
  handleError(detail: string | boolean = false) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detail ? (detail as string) : 'Error creating experiment',
    });
  }
}
