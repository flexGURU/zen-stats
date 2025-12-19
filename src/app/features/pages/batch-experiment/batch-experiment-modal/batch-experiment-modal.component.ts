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
import { ProgressSpinner } from 'primeng/progressspinner';

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
    ProgressSpinner,
  ],
  templateUrl: './batch-experiment-modal.component.html',
  styles: ``,
})
export class BatchExperimentModalComponent {
  experimentForm!: FormGroup;
  private fb = inject(FormBuilder);

  modalVisible = model(false);
  reactors = reactorQuery().reactorData;
  readonly = input(false);

  co2Forms = signal([
    { label: 'Gaseous', value: 'gaseous' },
    { label: 'Carbonated', value: 'carbonated' },
    { label: 'Liquid', value: 'liquid' },
  ]);
  mutationStatus = output<Record<string, boolean | string>>();
  loading = signal(false);
  batchExperimentData = signal<BatchExperiment | null>(null);
  closeModal = output<void>();
  selectedFile = signal<File | null>(null);
  uploadingFiles = signal<Map<number, boolean>>(new Map());

  private firebaseService = inject(FirebaseService);

  constructor() {
    this.initializeForm();
    this.analyticalTests.disable();
    effect(() => {
      if (this.readonly()) {
        this.experimentForm.disable();
        this.analyticalTests.disable();
      }
    });
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
  openModal(batchData: BatchExperiment | null) {
    this.batchExperimentData.set(batchData);
    if (batchData) {
      this.populateForm();
    } else {
      this.reset();
    }

    this.modalVisible.set(true);
  }
  get formControls() {
    return this.experimentForm.controls;
  }

  get analyticalTests(): FormArray {
    return this.experimentForm.get('analyticalTests') as FormArray;
  }

  private createAnalyticalTest(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      sampleId: ['', Validators.required],
      date: [null],
      pdfUrl: [null],
    });
  }

  addAnalyticalTest() {
    this.analyticalTests.push(this.createAnalyticalTest());
  }

  removeAnalyticalTest(index: number) {
    this.analyticalTests.removeAt(index);
    this.uploadingFiles.update((map) => {
      const newMap = new Map(map);
      newMap.delete(index);
      return newMap;
    });
  }

  removeFile(url: string, index: number) {
    this.analyticalTests.at(index).patchValue({ pdfUrl: null });
  }

  populateForm() {
    this.experimentForm.patchValue({
      batchId: this.batchExperimentData()?.batchId,
      operator: this.batchExperimentData()?.operator,
      date: this.batchExperimentData()?.date
        ? new Date(this.batchExperimentData()!.date!)
        : null,
      reactorId: this.batchExperimentData()?.reactorId,
      blockId: this.batchExperimentData()?.blockId,
      timeStart: this.timeStringToDate(this.batchExperimentData()?.timeStart),
      timeEnd: this.timeStringToDate(this.batchExperimentData()?.timeEnd),

      mixDesign: this.batchExperimentData()?.materialFeedstock?.mixDesign,
      cement: this.batchExperimentData()?.materialFeedstock?.cement,
      fineAggregate:
        this.batchExperimentData()?.materialFeedstock?.fineAggregate,
      coarseAggregate:
        this.batchExperimentData()?.materialFeedstock?.coarseAggregate,
      water: this.batchExperimentData()?.materialFeedstock?.water,
      waterCementRatio:
        this.batchExperimentData()?.materialFeedstock?.waterCementRatio,
      blockSizeLength:
        this.batchExperimentData()?.materialFeedstock?.blockSizeLength,
      blockSizeWidth:
        this.batchExperimentData()?.materialFeedstock?.blockSizeWidth,
      blockSizeHeight:
        this.batchExperimentData()?.materialFeedstock?.blockSizeHeight,

      co2Form: this.batchExperimentData()?.exposureConditions?.co2Form,
      co2Mass: this.batchExperimentData()?.exposureConditions?.co2Mass,
      injectionPressure:
        this.batchExperimentData()?.exposureConditions?.injectionPressure,
      headSpace: this.batchExperimentData()?.exposureConditions?.headSpace,
      reactionTime:
        this.batchExperimentData()?.exposureConditions?.reactionTime,
    });
    this.populateAnalyticalTests(
      this.batchExperimentData()?.analyticalTests || []
    );
  }

  populateAnalyticalTests(tests: any[]) {
    const formArray = this.analyticalTests;

    formArray.clear();

    tests.forEach((test) => {
      formArray.push(
        this.fb.group({
          name: [test.name ?? '', Validators.required],
          sampleId: [test.sampleId ?? '', Validators.required],
          date: [test.date ? new Date(test.date) : null, Validators.required],
          pdfUrl: [test.pdfUrl ?? ''],
        })
      );
    });
  }

  onFileSelect(event: any, index: number) {
    const file = event.files?.[0];
    if (file) {
      this.selectedFile.set(file);
      this.uploadingFiles.update((map) => {
        const newMap = new Map(map);
        newMap.set(index, true);
        return newMap;
      });

      this.uploadFileEvent()
        .then((fileUrl) => {
          if (fileUrl) {
            this.analyticalTests.at(index).patchValue({ pdfUrl: fileUrl });
          }

          this.uploadingFiles.update((map) => {
            const newMap = new Map(map);
            newMap.set(index, false);
            return newMap;
          });
        })
        .catch(() => {
          // Clear uploading state on error
          this.uploadingFiles.update((map) => {
            const newMap = new Map(map);
            newMap.set(index, false);
            return newMap;
          });
        });
    }
  }

  async uploadFileEvent() {
    if (this.selectedFile()) {
      try {
        const fileUrl = await this.firebaseService.uploadImage(
          this.selectedFile()!
        );

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

    this.loading.set(true);

    this.batchExperimentData()
      ? this.updateBatchExperiment(this.batchExperimentData()!.id, payload)
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
    this.uploadingFiles.set(new Map());
    this.analyticalTests.clear();
  }

  private formatTime(date: any): string | null {
    if (!date) return null;

    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
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
