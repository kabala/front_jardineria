# Front Jardinería

Aplicación web para visualizar facturas de servicios de jardinería y descargarlas en PDF.

Hecha con Angular 20 y Vite (a través del builder `@angular/build:application`).

## Requisitos

- Node.js 22.22.3 o superior
- npm 10+

## Instalación

```bash
npm install
```

## Desarrollo

Levanta un servidor local con recarga en caliente:

```bash
npm start
```

Abre http://localhost:4200 en el navegador.

## Build

Genera los archivos listos para producción en la carpeta `dist/`:

```bash
npm run build
```

## Qué hace

- Muestra un listado de facturas con número, cliente, fechas, estado y total.
- Resume ingresos: cobrado, pendiente y vencido.
- Filtra por estado (pagada, pendiente, vencida).
- Abre una vista de detalle de cada factura.
- Descarga cada factura como PDF con encabezado de la empresa, datos del cliente, tabla de ítems, subtotal, IVA (19%) y total.

Los datos son de ejemplo y corresponden a un periodo de hace un mes.

## Estructura principal

```
src/app/
  models/      interfaces de factura y constantes de empresa
  data/        facturas de ejemplo
  services/    lógica de facturas y generación de PDF
  app.*        componente principal (dashboard)
```

El PDF se genera con [jsPDF](https://github.com/parallax/jsPDF) y [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable).
