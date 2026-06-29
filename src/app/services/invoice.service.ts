import { Injectable, computed, signal } from '@angular/core';
import { Invoice, InvoiceTotals, TAX_RATE } from '../models/invoice';
import { INVOICES } from '../data/invoices';

export interface NewInvoice {
  number: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  status: Invoice['status'];
  items: { description: string; quantity: number; unitPrice: number }[];
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly invoices = signal<Invoice[]>([...INVOICES]);

  readonly list = this.invoices.asReadonly();

  readonly summary = computed(() => {
    const list = this.invoices();
    const totals = list.map((i) => this.computeTotals(i).total);
    const totalRevenue = totals.reduce((a, b) => a + b, 0);
    const paid = list
      .filter((i) => i.status === 'paid')
      .reduce((a, i) => a + this.computeTotals(i).total, 0);
    const pending = list
      .filter((i) => i.status === 'pending')
      .reduce((a, i) => a + this.computeTotals(i).total, 0);
    const overdue = list
      .filter((i) => i.status === 'overdue')
      .reduce((a, i) => a + this.computeTotals(i).total, 0);
    return {
      count: list.length,
      totalRevenue,
      paid,
      pending,
      overdue,
    };
  });

  getById(id: string): Invoice | undefined {
    return this.invoices().find((i) => i.id === id);
  }

  create(input: NewInvoice): Invoice {
    const list = this.invoices();
    const nextId = list.length
      ? String(Math.max(...list.map((i) => Number(i.id))) + 1)
      : '1';
    const invoice: Invoice = { id: nextId, ...input };
    this.invoices.update((current) => [...current, invoice]);
    return invoice;
  }

  computeTotals(invoice: Invoice): InvoiceTotals {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const tax = Math.round(subtotal * TAX_RATE);
    return { subtotal, tax, total: subtotal + tax };
  }
}
