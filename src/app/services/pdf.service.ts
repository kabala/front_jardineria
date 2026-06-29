import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { COMPANY, Invoice, TAX_RATE } from '../models/invoice';
import { InvoiceService } from './invoice.service';

@Injectable({ providedIn: 'root' })
export class PdfService {
  constructor(private readonly invoices: InvoiceService) {}

  download(invoice: Invoice): void {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Encabezado de la empresa
    doc.setFillColor(34, 139, 87);
    doc.rect(0, 0, pageWidth, 70, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(COMPANY.name, margin, 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(COMPANY.address, margin, 48);
  doc.text(`NIT: ${COMPANY.nit}  ·  ${COMPANY.phone}  ·  ${COMPANY.email}`, margin, 60);

    // Título FACTURA
    doc.setTextColor(34, 139, 87);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('FACTURA', pageWidth - margin, 30, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(invoice.number, pageWidth - margin, 46, { align: 'right' });

    let y = 100;

    // Datos del cliente
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 70, 4, 4, 'FD');
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Facturar a:', margin + 12, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoice.clientName, margin + 12, y + 34);
    doc.text(invoice.clientAddress, margin + 12, y + 48);
    doc.text(invoice.clientEmail, margin + 12, y + 60);

    // Fechas
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha emisión:', pageWidth - margin - 140, y + 18);
    doc.text('Vencimiento:', pageWidth - margin - 140, y + 38);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatDate(invoice.issueDate), pageWidth - margin - 12, y + 18, {
      align: 'right',
    });
    doc.text(this.formatDate(invoice.dueDate), pageWidth - margin - 12, y + 38, {
      align: 'right',
    });

    // Estado
    doc.setFont('helvetica', 'bold');
    const statusLabel = this.statusLabel(invoice.status);
    doc.setTextColor(...this.statusColor(invoice.status));
    doc.text(`Estado: ${statusLabel}`, pageWidth - margin - 12, y + 58, {
      align: 'right',
    });

    y += 90;

    // Tabla de items
    const body = invoice.items.map((item) => [
      item.description,
      item.quantity.toString(),
      this.money(item.unitPrice),
      this.money(item.quantity * item.unitPrice),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Descripción', 'Cant.', 'Precio unit.', 'Subtotal']],
      body,
      theme: 'striped',
      headStyles: { fillColor: [34, 139, 87], fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: pageWidth - margin * 2 - 180 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 70, halign: 'right' },
        3: { cellWidth: 70, halign: 'right' },
      },
      margin: { left: margin, right: margin },
    });

    // @ts-expect-error jspdf-autotable adds lastAutoTable
    y = doc.lastAutoTable.finalY + 20;

    const totals = this.invoices.computeTotals(invoice);
    const labelX = pageWidth - margin - 160;
    const valueX = pageWidth - margin - 12;

    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Subtotal:', labelX, y);
    doc.text(this.money(totals.subtotal), valueX, y, { align: 'right' });
    y += 16;
    doc.text(`IVA (${Math.round(TAX_RATE * 100)}%):`, labelX, y);
    doc.text(this.money(totals.tax), valueX, y, { align: 'right' });
    y += 18;

    doc.setDrawColor(34, 139, 87);
    doc.setLineWidth(1);
    doc.line(labelX, y - 4, valueX, y - 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(34, 139, 87);
    doc.text('TOTAL:', labelX, y + 10);
    doc.text(this.money(totals.total), valueX, y + 10, { align: 'right' });

    y += 40;
    if (invoice.notes) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Notas: ${invoice.notes}`, margin, y);
    }

    // Pie
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `${COMPANY.name} · ${COMPANY.nit} · ${COMPANY.email}`,
      pageWidth / 2,
      pageHeight - 24,
      { align: 'center' },
    );

    doc.save(`${invoice.number}.pdf`);
  }

  private money(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }

  private formatDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  }

  private statusLabel(status: Invoice['status']): string {
    return status === 'paid'
      ? 'PAGADA'
      : status === 'pending'
        ? 'PENDIENTE'
        : 'VENCIDA';
  }

  private statusColor(status: Invoice['status']): [number, number, number] {
    return status === 'paid'
      ? [22, 163, 74]
      : status === 'pending'
        ? [202, 138, 4]
        : [220, 38, 38];
  }
}
