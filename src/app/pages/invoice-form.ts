import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InvoiceStatus } from '../models/invoice';
import { InvoiceService } from '../services/invoice.service';

function isoDate(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? null : { isoDate: true };
}

function emailList(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value.trim()) ? null : { email: true };
}

type ItemControls = {
  description: FormControl<string>;
  quantity: FormControl<number>;
  unitPrice: FormControl<number>;
};

@Component({
  selector: 'app-invoice-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './invoice-form.html',
  styleUrl: './invoice-form.css',
})
export class InvoiceForm {
  private readonly fb = inject(FormBuilder);
  private readonly invoiceService = inject(InvoiceService);
  private readonly router = inject(Router);

  readonly statuses: { value: InvoiceStatus; label: string }[] = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagada' },
    { value: 'overdue', label: 'Vencida' },
  ];

  readonly today = new Date().toISOString().slice(0, 10);
  readonly defaultDue = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  })();

  readonly form = this.fb.nonNullable.group({
    number: [
      '',
      [Validators.required, Validators.pattern(/^FAC-\d{4}-\d{3,4}$/)],
    ],
    clientName: ['', [Validators.required, Validators.minLength(3)]],
    clientAddress: ['', [Validators.required, Validators.minLength(5)]],
    clientEmail: ['', [Validators.required, emailList]],
    issueDate: [this.today, [Validators.required, isoDate]],
    dueDate: [this.defaultDue, [Validators.required, isoDate]],
    status: ['pending' as InvoiceStatus, [Validators.required]],
    notes: [''],
    items: this.fb.nonNullable.array<FormGroup<ItemControls>>([]),
  });

  readonly items = this.form.controls.items;

  readonly subtotal = computed(() =>
    this.items.controls.reduce((sum, row) => {
      const qty = row.controls.quantity.value;
      const price = row.controls.unitPrice.value;
      return sum + (qty || 0) * (price || 0);
    }, 0),
  );
  readonly tax = computed(() => Math.round(this.subtotal() * 0.19));
  readonly total = computed(() => this.subtotal() + this.tax());

  submitted = false;

  constructor() {
    this.addItem();
  }

  get itemsArray(): FormGroup<ItemControls>[] {
    return this.items.controls;
  }

  addItem(): void {
    this.items.push(
      this.fb.nonNullable.group({
        description: ['', [Validators.required, Validators.minLength(3)]],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(1)]],
      }),
    );
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  invalid(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty || this.submitted);
  }

  money(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const created = this.invoiceService.create({
      number: v.number,
      clientName: v.clientName,
      clientAddress: v.clientAddress,
      clientEmail: v.clientEmail,
      issueDate: v.issueDate,
      dueDate: v.dueDate,
      status: v.status,
      items: v.items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      notes: v.notes?.trim() || undefined,
    });
    this.router.navigate(['/facturas']);
    void created;
  }
}
