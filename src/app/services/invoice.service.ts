import { Injectable } from '@angular/core';
import { Invoice, InvoiceTotals, TAX_RATE } from '../models/invoice';
import { INVOICES } from '../data/invoices';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly invoices: Invoice[] = [...INVOICES];

  getAll(): Invoice[] {
    return [...this.invoices];
  }

  getById(id: string): Invoice | undefined {
    return this.invoices.find((i) => i.id === id);
  }

  computeTotals(invoice: Invoice): InvoiceTotals {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const tax = Math.round(subtotal * TAX_RATE);
    return { subtotal, tax, total: subtotal + tax };
  }

  summary() {
    const totals = this.invoices.map((i) => this.computeTotals(i).total);
    const totalRevenue = totals.reduce((a, b) => a + b, 0);
    const paid = this.invoices
      .filter((i) => i.status === 'paid')
      .reduce((a, i) => a + this.computeTotals(i).total, 0);
    const pending = this.invoices
      .filter((i) => i.status === 'pending')
      .reduce((a, i) => a + this.computeTotals(i).total, 0);
    const overdue = this.invoices
      .filter((i) => i.status === 'overdue')
      .reduce((a, i) => a + this.computeTotals(i).total, 0);
    return {
      count: this.invoices.length,
      totalRevenue,
      paid,
      pending,
      overdue,
    };
  }
}
