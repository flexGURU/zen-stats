import { CommonModule } from '@angular/common';
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
  FormBuilder,
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Reactor } from '../../../../core/models/models';
import { ReactorService } from '../reactor.service';
import { finalize } from 'rxjs';
import { Chip } from 'primeng/chip';
import { FirebaseService } from '../../../../core/services/firebase.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-reactor-modal',
  imports: [
    InputTextModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SelectModule,
    FileUpload,
    CommonModule,
    TagModule,
  ],
  templateUrl: './reactor-modal.component.html',
  styles: ``,
})
export class ReactorModalComponent {
  reactorForm!: FormGroup;

  visible = model(false);
  isEditMode = model(false);
  selectedFile = signal<File | null>(null);
  @Input() reactorData: Reactor | null = null;

  loading = signal(false);
  removeLoading = signal(false);

  private fb = inject(FormBuilder);
  private reactorService = inject(ReactorService);
  private firebaseService = inject(FirebaseService);
  mutationStatus = output<Record<string, boolean | string>>();

  statusOptions = signal([
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ]);
  pathwayOptions = signal([
    { label: 'Gaseous', value: 'gaseous' },
    { label: 'Carbonated', value: 'carbonated' },
    { label: 'Liquid', value: 'liquid' },
  ]);

  constructor() {
    this.initialiseForm();
    effect(() => {});
  }

  initialiseForm() {
    this.reactorForm = this.fb.group({
      name: ['', Validators.required],
      status: ['', Validators.required],
      pathway: ['', Validators.required],
      pdfUrl: [''],
    });
  }

  ngOnChanges() {
    if (this.reactorData) {
      this.populateForm();
    } else {
      this.reactorForm.reset();
    }
  }

  populateForm() {
    this.reactorForm.patchValue({
      name: this.reactorData?.name,
      pathway: this.reactorData?.pathway,
      pdfUrl: this.reactorData?.pdfUrl,
      status: this.reactorData?.status,
    });
  }
  get formControls() {
    return this.reactorForm.controls;
  }

  async onSubmit() {
    if (this.reactorForm.invalid) return;
    const reactor: Reactor = this.reactorForm.getRawValue();
    this.loading.set(true);

    try {
      if (this.selectedFile()) {
        const imageUrl = await this.firebaseService.uploadImage(
          this.selectedFile()!
        );
        reactor.pdfUrl = imageUrl;
      }
    } catch (error) {
      this.loading.set(false);
      this.mutationStatus.emit({
        status: false,
        detail: 'Error uploading file',
      });
      return;
    }

    this.reactorData
      ? this.updateReactor(reactor)
      : this.createReactor(reactor);
  }

  createReactor(reactor: Reactor) {
    this.reactorService
      .createReactor(reactor)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.reactorForm.reset();
          this.selectedFile.set(null);
          this.mutationStatus.emit({
            status: true,
            detail: 'Reactor created successfully',
          });
        },
        error: () => {
          this.mutationStatus.emit({
            status: false,
            detail: 'Error creating reactor',
          });
        },
      });
  }
  updateReactor(reactor: Reactor) {
    this.reactorService
      .updateReactor(this.reactorData!.id, reactor)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.reactorForm.reset();
          this.selectedFile.set(null);
          this.mutationStatus.emit({
            status: true,
            detail: 'Reactor updated successfully',
          });
        },
        error: () => {
          this.mutationStatus.emit({
            status: false,
            detail: 'Error updating reactor',
          });
        },
      });
  }

  onFileSelect(event: any, fieldName: string) {
    const file = event.files[0];
    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.reactorForm.patchValue({
        [fieldName]: reader.result,
      });
    };
    reader.readAsDataURL(file);
  }

  removeFile() {
    this.removeLoading.set(true);
    this.firebaseService
      .removeImage(this.reactorData?.pdfUrl!)
      .pipe(
        finalize(() => {
          this.removeLoading.set(false);
        })
      )
      .subscribe({
        next: () => {
          if (this.reactorData) {
            this.reactorData.pdfUrl = '';
            this.reactorForm.patchValue({ pdfUrl: '' });
            this.reactorService
              .updateReactor(this.reactorData.id, this.reactorData)
              .subscribe();
          }
          this.selectedFile.set(null);
        },
        error: () => {
          this.mutationStatus.emit({
            status: false,
            detail: 'Error removing file',
          });
        },
      });
  }

  ngOnDestroy() {
    this.reactorForm.reset();
  }
}
