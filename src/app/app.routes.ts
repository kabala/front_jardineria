import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard';
import { InvoiceForm } from './pages/invoice-form';

export const routes: Routes = [
  { path: '', redirectTo: 'facturas', pathMatch: 'full' },
  { path: 'facturas', component: Dashboard, title: 'Facturas' },
  { path: 'facturas/nueva', component: InvoiceForm, title: 'Nueva factura' },
  { path: '**', redirectTo: 'facturas' },
];
