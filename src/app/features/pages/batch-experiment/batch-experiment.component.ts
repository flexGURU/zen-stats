import { Component, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { BatchExperimentModalComponent } from './batch-experiment-modal/batch-experiment-modal.component';

@Component({
  selector: 'app-batch-experiment',
  imports: [
    TableModule,
    ButtonModule,
    Dialog,
    BatchExperimentModalComponent,
    Toast,
    ConfirmDialog,
  ],
  templateUrl: './batch-experiment.component.html',
  providers: [ConfirmationService, MessageService],
})
export class BatchExperimentComponent {
  displayModal = signal(false);
  isEditMode = signal(false);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  batchExperiments = [
    { id: 1, name: 'Experiment 1', status: 'Running' },
    { id: 2, name: 'Experiment 2', status: 'Completed' },
    { id: 3, name: 'Experiment 3', status: 'Failed' },
  ];

  editBatchExperiment = (experiment: {
    id: number;
    name: string;
    status: string;
  }) => {
    this.isEditMode.set(true);
    this.displayModal.set(true);
  };

  createBatchExperiment = () => {
    this.isEditMode.set(false);
    this.displayModal.set(true);
  };

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
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'You have accepted',
        });
      },
    });
  };
}
