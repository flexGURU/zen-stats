import { Component, effect, inject, signal } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { batchExperimentQuery } from './batch-experiment.query';
import { BatchExperiment } from '../../../core/models/models';
import { BatchExperimentService } from './batch-experiment.service';

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
  ],
  templateUrl: './batch-experiment.component.html',
  providers: [ConfirmationService, MessageService],
})
export class BatchExperimentComponent {
  displayModal = signal(false);
  isEditMode = signal(false);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  datePlacehHolder = new Date();
  todaysDate = this.datePlacehHolder.toLocaleDateString();
  selectedExperiment = signal<BatchExperiment | null>(null);

  batchId = signal('');
  reactorName = signal('');
  date = signal('');

  batchExperiments = batchExperimentQuery().batchExperimentData;
  private batchExperimentService = inject(BatchExperimentService);

  constructor() {
    effect(() => {
      if (!this.displayModal()) {
        this.selectedExperiment.set(null);
      }
    });
  }

  editBatchExperiment = (experiment: BatchExperiment) => {
    this.isEditMode.set(true);
    this.selectedExperiment.set(experiment);
    this.displayModal.set(true);
  };

  createBatchExperiment = () => {
    this.isEditMode.set(false);
    this.displayModal.set(true);
  };

  filter() {}
  clearFilters() {
    this.batchId.set('');
    this.reactorName.set('');
    this.date.set('');
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
