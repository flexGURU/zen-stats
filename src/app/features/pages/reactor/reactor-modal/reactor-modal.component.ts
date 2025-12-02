import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, model, signal } from '@angular/core';
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
  ],
  templateUrl: './reactor-modal.component.html',
  styles: ``,
})
export class ReactorModalComponent {
  reactorForm!: FormGroup;

  visible = model(false);
  isEditMode = model(false);
  reactorData = input<Reactor | null>(null);

  private fb = inject(FormBuilder);

  statusOptions = signal([
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Maintenance', value: 'Maintenance' },
  ]);
  pathwayOptions = signal([
    { label: 'Gaseous', value: 'Gaseous' },
    { label: 'Carbonated', value: 'Carbonated' },
    { label: 'Liquid', value: 'Liquid' },
  ]);

  constructor() {
    this.initialiseForm();
    this.populateForm();
    effect(() => {
      if (!this.visible()) {
        console.log('ssss', this.visible());

        this.reactorForm.reset();
      }
    });

    effect(() => {
      this.populateForm();
    });
  }

  initialiseForm() {
    this.reactorForm = this.fb.group({
      name: ['', Validators.required],
      reactorId: ['', Validators.required],
      status: ['', Validators.required],
      pathway: ['', Validators.required],
      pdfUrl: ['', Validators.required],
    });
  }

  populateForm() {
    this.reactorForm.patchValue({
      name: this.reactorData()?.name,
      reactorId: this.reactorData()?.id,
      pathway: this.reactorData()?.pathway,
      pdfUrl: this.reactorData()?.pdfUrl,
      status: this.reactorData()?.status,
    });
  }
  get formControls() {
    return this.reactorForm.controls;
  }

  onSubmit() {
    if (this.reactorForm.valid) {
      console.log(this.reactorForm.value);
    }
  }
  onFileSelect(event: any, fieldName: string) {
    const file = event.files[0];
    this.reactorForm.patchValue({ [fieldName]: file });
  }
}
