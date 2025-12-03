import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';

const notificationResponse = (status: boolean, detail: string) => {
  const messageService = inject(MessageService);

  const handleSuccess = (detail: string) => {
    messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: detail,
    });
  };

  const handleError = (detail: string) => {
    messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detail,
    });
  };

  status ? handleSuccess(detail) : handleError(detail);
};

export default notificationResponse;
