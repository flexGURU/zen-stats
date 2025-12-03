import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // private messageService = inject(MessageService);

  // actuateResponse = (status: boolean, detail: string) => {
  //   status ? this.handleSuccess(detail) : this.handleError(detail);
  // };

  // private handleSuccess = (detail: string) => {
  //   this.messageService.add({
  //     severity: 'success',
  //     summary: 'Success',
  //     detail: detail,
  //   });
  // };
  // private handleError = (detail: string) => {
  //   this.messageService.add({
  //     severity: 'error',
  //     summary: 'Error',
  //     detail: detail,
  //   });
  // };
}
