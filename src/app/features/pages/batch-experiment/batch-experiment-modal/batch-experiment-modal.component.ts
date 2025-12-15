import {
  Component,
  effect,
  inject,
  Input,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  Form,
  FormArray,
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
import { BatchExperimentService } from '../batch-experiment.service';
import { BatchExperiment } from '../../../../core/models/models';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { reactorQuery } from '../../reactor/reactor.query';
import { FirebaseService } from '../../../../core/services/firebase.service';

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
  experimentForm!: FormGroup;
  private fb = inject(FormBuilder);

  modalVisible = model(false);
  reactors = reactorQuery().reactorData;

  co2Forms = signal([
    { label: 'Gaseous', value: 'gaseous' },
    { label: 'Carbonated', value: 'carbonated' },
    { label: 'Liquid', value: 'liquid' },
  ]);
  mutationStatus = output<Record<string, boolean | string>>();
  loading = signal(false);
  @Input() batchExperimentData: BatchExperiment | null = null;
  closeModal = output<void>();
  selectedFile = signal<File | null>(null);
  uploadingFile = signal({
    status: false,
    fileIndex: 0,
  });

  private firebaseService = inject(FirebaseService);

  constructor() {
    this.initializeForm();
  }
  ngOnChanges() {
    if (this.batchExperimentData) {
      this.populateForm();
    } else {
      this.experimentForm.reset();
    }
  }

  private batchExperimentService = inject(BatchExperimentService);

  initializeForm() {
    this.experimentForm = this.fb.group({
      batchId: ['', Validators.required],
      operator: ['', Validators.required],
      date: [null, Validators.required],
      reactorId: ['', Validators.required],
      blockId: ['', Validators.required],
      timeStart: ['', Validators.required],
      timeEnd: ['', Validators.required],

      mixDesign: [''],
      cement: [null, Validators.min(0)],
      fineAggregate: [null, Validators.min(0)],
      coarseAggregate: [null, Validators.min(0)],
      water: [null, Validators.min(0)],
      waterCementRatio: [null, Validators.min(0)],
      blockSizeLength: [null, Validators.min(0)],
      blockSizeWidth: [null, Validators.min(0)],
      blockSizeHeight: [null, Validators.min(0)],

      gasCO2: [false],
      deliveryPressure: [false],

      co2Form: [''],
      co2Mass: [null, Validators.min(0)],
      injectionPressure: [null, Validators.min(0)],
      headSpace: [null, Validators.min(0)],
      reactionTime: [null, Validators.min(0)],

      analyticalTests: this.fb.array([]),
    });
  }

  get analyticalTests(): FormArray {
    return this.experimentForm.get('analyticalTests') as FormArray;
  }

  private createAnalyticalTest(): FormGroup {
    return this.fb.group({
      testType: ['', Validators.required],
      sampleId: ['', Validators.required],
      date: [null],
      file: [null],
    });
  }
  addAnalyticalTest() {
    this.analyticalTests.push(this.createAnalyticalTest());
  }

  removeAnalyticalTest(index: number) {
    this.analyticalTests.removeAt(index);
  }

  populateForm() {
    console.log('data', this.batchExperimentData);

    this.experimentForm.patchValue({
      batchId: this.batchExperimentData?.batchId,
      operator: this.batchExperimentData?.operator,
      date: this.shortenDate(this.batchExperimentData?.date || ''),
      reactorId: this.batchExperimentData?.reactorId,
      blockId: this.batchExperimentData?.blockId,
      timeStart: this.timeStringToDate(this.batchExperimentData?.timeStart),
      timeEnd: this.timeStringToDate(this.batchExperimentData?.timeEnd),

      mixDesign: this.batchExperimentData?.materialFeedstock?.mixDesign,
      cement: this.batchExperimentData?.materialFeedstock?.cement,
      fineAggregate: this.batchExperimentData?.materialFeedstock?.fineAggregate,
      coarseAggregate:
        this.batchExperimentData?.materialFeedstock?.coarseAggregate,
      water: this.batchExperimentData?.materialFeedstock?.water,
      waterCementRatio:
        this.batchExperimentData?.materialFeedstock?.waterCementRatio,
      blockSizeLength:
        this.batchExperimentData?.materialFeedstock?.blockSizeLength,
      blockSizeWidth:
        this.batchExperimentData?.materialFeedstock?.blockSizeWidth,
      blockSizeHeight:
        this.batchExperimentData?.materialFeedstock?.blockSizeHeight,

      co2Form: this.batchExperimentData?.exposureConditions?.co2Form,
      co2Mass: this.batchExperimentData?.exposureConditions?.co2Mass,
      injectionPressure:
        this.batchExperimentData?.exposureConditions?.injectionPressure,
      headSpace: this.batchExperimentData?.exposureConditions?.headSpace,
      reactionTime: this.batchExperimentData?.exposureConditions?.reactionTime,
    });
  }

  get formControls() {
    return this.experimentForm.controls;
  }
  onFileSelect(event: any, index: number) {
    const file = event.files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
    this.uploadFileEvent().then((fileUrl) => {
      if (fileUrl) {
        this.analyticalTests.at(index).patchValue({ file: fileUrl });
      }
    });
  }

  async uploadFileEvent() {
    if (this.selectedFile()) {
      try {
        const fileUrl = await this.firebaseService.uploadImage(
          this.selectedFile()!
        );
        console.log('file url', fileUrl);

        return fileUrl;
      } catch (error) {
        this.mutationStatus.emit({
          status: false,
          detail: 'Error uploading file',
        });
        return null;
      }
    }
    return null;
  }

  onSubmit() {
    if (this.experimentForm.invalid) return;
    const payload: BatchExperiment = this.experimentForm.getRawValue();

    if (payload) {
      payload.timeStart = this.formatTime(payload.timeStart) ?? '';
      payload.timeEnd = this.formatTime(payload.timeEnd) ?? '';
      payload.date = this.formatDate(new Date(payload.date));
    }
    console.log('payload', payload);

    this.loading.set(true);

    this.batchExperimentData
      ? this.updateBatchExperiment(this.batchExperimentData.id, payload)
      : this.createBatchExperiment(payload);
  }

  createBatchExperiment(experiment: BatchExperiment) {
    this.batchExperimentService
      .createBatchExperiment(experiment)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.mutationStatus.emit({
            status: true,
            detail: 'Experiment created successfully',
          });
          this.closeModal.emit();
        },
        error: () => {
          this.mutationStatus.emit({
            status: false,
            detail: 'Error creating experiment',
          });
        },
      });
  }

  updateBatchExperiment(experimentId: number, experiment: BatchExperiment) {
    this.batchExperimentService
      .updateBatchExperiment(experimentId, experiment)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.mutationStatus.emit({
            status: true,
            detail: 'Experiment updated successfully',
          });
          this.closeModal.emit();
        },
        error: () => {
          this.mutationStatus.emit({
            status: false,
            detail: 'Error updating experiment',
          });
        },
      });
  }

  reset() {
    this.experimentForm.reset();
  }
  private formatTime(date: any): string | null {
    if (!date) return null;

    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  private shortenDate(date: string | Date): string {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private formatDate(date: Date): Date {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const formatted = `${year}-${month}-${day}`;

    let formattedDate = new Date(formatted);

    return formattedDate;
  }
  private timeStringToDate(time: string | undefined): Date | null {
    if (!time) return null;

    const [hours, minutes] = time.split(':').map(Number);

    const d = new Date(); // today's date
    d.setHours(hours, minutes, 0, 0); // set hours and minutes

    return d;
  }
}
