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
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-reactor-modal',
  imports: [
    InputTextModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './reactor-modal.component.html',
  styles: ``,
})
export class ReactorModalComponent {
  reactorForm!: FormGroup;

  visible = model(false);
  isEditMode = model(false);
  reactorData = input<{ name: string; status: string } | null>(null);

  private fb = inject(FormBuilder);

  constructor() {
    this.initialiseForm();
    this.populateForm();
    effect(() => {
      if (!this.visible()) {
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
      status: ['', Validators.required],
    });
  }

  populateForm() {
    this.reactorForm.patchValue({
      name: this.reactorData()?.name,
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
}
