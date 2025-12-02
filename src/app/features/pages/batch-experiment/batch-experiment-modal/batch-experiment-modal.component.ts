import { Component, inject, signal } from '@angular/core';
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
import { SelectModule } from 'primeng/select';

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
    SelectModule,
  ],
  templateUrl: './batch-experiment-modal.component.html',
  styles: ``,
})
export class BatchExperimentModalComponent {
  batchForm!: FormGroup;
  private fb = inject(FormBuilder);
  co2Forms = signal([
    { label: 'Gaseous', value: 'gaseous' },
    { label: 'Carbonated', value: 'carbonated' },
    { label: 'Liquid', value: 'liquid' },
  ]);
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

      co2Form: ['', Validators.required],
      co2Mass: [null, [Validators.required, Validators.min(0)]],
      injectionPressure: [null, [Validators.required, Validators.min(0)]],
      headSpace: [null, [Validators.required, Validators.min(0)]],
      reactionTime: [null, [Validators.required, Validators.min(0)]],

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
