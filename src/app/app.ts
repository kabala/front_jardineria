import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice, InvoiceStatus } from './models/invoice';
import { InvoiceService } from './services/invoice.service';
import { PdfService } from './services/pdf.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly invoiceService = inject(InvoiceService);
  private readonly pdfService = inject(PdfService);

  readonly invoices = this.invoiceService.getAll();
  readonly summary = this.invoiceService.summary();

  readonly selectedId = signal<string | null>(null);
  readonly selected = computed<Invoice | null>(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.invoices.find((i) => i.id === id) ?? null;
  });

  readonly filter = signal<InvoiceStatus | 'all'>('all');

  readonly filtered = computed<Invoice[]>(() => {
    const f = this.filter();
    return f === 'all'
      ? this.invoices
      : this.invoices.filter((i) => i.status === f);
  });

  totals(invoice: Invoice) {
    return this.invoiceService.computeTotals(invoice);
  }

  select(invoice: Invoice) {
    this.selectedId.set(invoice.id);
  }

  close() {
    this.selectedId.set(null);
  }

  download(invoice: Invoice) {
    this.pdfService.download(invoice);
  }

  setFilter(value: InvoiceStatus | 'all') {
    this.filter.set(value);
  }

  statusClass(status: InvoiceStatus): string {
    return `badge badge-${status}`;
  }

  statusLabel(status: InvoiceStatus): string {
    return status === 'paid'
      ? 'Pagada'
      : status === 'pending'
        ? 'Pendiente'
        : 'Vencida';
  }

  money(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }

  formatDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  }

  trackById(_index: number, invoice: Invoice): string {
    return invoice.id;
  }
}
