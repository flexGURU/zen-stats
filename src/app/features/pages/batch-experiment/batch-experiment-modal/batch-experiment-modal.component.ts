import { Component, inject } from '@angular/core';
import {
  Form,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-batch-experiment-modal',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePicker,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    ButtonModule,
    FileUploadModule,
  ],
  templateUrl: './batch-experiment-modal.component.html',
  styles: ``,
})
export class BatchExperimentModalComponent {
  batchForm!: FormGroup;
  private fb = inject(FormBuilder);
  constructor() {
    this.initializeForm();
  }

  initializeForm() {
    this.batchForm = this.fb.group({
      batchId: ['', Validators.required],
      operator: ['', Validators.required],
      date: [null, Validators.required],
      reactorId: ['', Validators.required],
      blockId: ['', Validators.required],
      timeStart: ['', Validators.required],
      timeEnd: ['', Validators.required],

      mixDesign: ['', Validators.required],
      cement: [null, [Validators.required, Validators.min(0)]],
      fineAggregate: [null, [Validators.required, Validators.min(0)]],
      coarseAggregate: [null, [Validators.required, Validators.min(0)]],
      water: [null, [Validators.required, Validators.min(0)]],
      waterCementRatio: [null, [Validators.required, Validators.min(0)]],
      blockSizeLength: [null, [Validators.required, Validators.min(0)]],
      blockSizeWidth: [null, [Validators.required, Validators.min(0)]],
      blockSizeHeight: [null, [Validators.required, Validators.min(0)]],

      gasCO2: [false],
      deliveryPressure: [false],

      tgaSampleId: [''],
      xrdSampleId: [''],
      tgaFile: [null],
      xrdFile: [null],
      compositionFile: [null],
    });
  }

  onSubmit() {
    if (this.batchForm.invalid) {
      console.log('Form Data:', this.batchForm.value);
      // Handle form submission
    } else {
      console.log('Form is invalid');
    }
  }
  onFileSelect(event: any, fieldName: string) {
    const file = event.files[0];
    this.batchForm.patchValue({ [fieldName]: file });
  }
  reset() {
    this.batchForm.reset();
  }
}
