export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  issueDate: string; // ISO yyyy-mm-dd
  dueDate: string; // ISO yyyy-mm-dd
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes?: string;
}

export interface InvoiceTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export const TAX_RATE = 0.19;
export const COMPANY = {
  name: 'Jardines Verdes S.A.S.',
  nit: '900.123.456-7',
  address: 'Calle 45 #23-10, Bogotá, Colombia',
  phone: '+57 601 555 0199',
  email: 'facturacion@jardinesverdes.co',
};
