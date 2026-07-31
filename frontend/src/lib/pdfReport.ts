import { Journey, CutoffPeriod, ReportSummary } from './api';

export interface PDFExportOptions {
  periodName: string;
  journeys: Journey[];
  summary?: ReportSummary;
  generatedBy?: string;
}

export function generateCutoffPDFReport({
  periodName,
  journeys,
  summary,
  generatedBy = 'Administración TrackFleet 360',
}: PDFExportOptions) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const todayStr = new Date().toLocaleDateString('es-NI', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalGpsKm = journeys.reduce((acc, j) => acc + j.gps_dist_km, 0);
  const totalSubsidy = journeys.reduce((acc, j) => {
    const sub = j.subsidy_amount || (j.gps_dist_km * (j.vehicle?.vehicle_type === 'moto' ? 6 : 10));
    return acc + sub;
  }, 0);

  const tableRowsHtml = journeys.map((j) => {
    const startDate = new Date(j.start_time);
    const endDate = j.end_time ? new Date(j.end_time) : null;

    const fechaStr = startDate.toLocaleDateString('es-NI');
    const horaInicioStr = startDate.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' });
    const horaFinStr = endDate ? endDate.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' }) : 'En Curso';

    const driverName = j.driver?.user?.full_name || 'Conductor N/A';
    const plate = j.vehicle?.plate_number || j.driver?.plate_number || 'N/A';
    const destination = j.destination || 'SINSA Altamira';

    const startKM = `${j.start_km.toLocaleString('es-NI')} KM`;
    const endKM = j.end_km ? `${j.end_km.toLocaleString('es-NI')} KM` : '-';
    const gpsKM = `${j.gps_dist_km.toFixed(1)} KM`;

    const subsidy = j.subsidy_amount
      ? `C$ ${j.subsidy_amount.toFixed(2)}`
      : `C$ ${(j.gps_dist_km * (j.vehicle?.vehicle_type === 'moto' ? 6 : 10)).toFixed(2)}`;

    return `
      <tr>
        <td style="font-weight: bold; color: #0f172a;">${destination}</td>
        <td style="text-align: center;">${fechaStr}</td>
        <td style="text-align: center;">${horaInicioStr}</td>
        <td style="text-align: center;">${horaFinStr}</td>
        <td style="text-align: right;">${startKM}</td>
        <td style="text-align: right;">${endKM}</td>
        <td style="text-align: right; font-weight: bold; color: #0284c7;">${gpsKM}</td>
        <td><strong>${driverName}</strong><br/><small style="color: #64748b;">(${plate})</small></td>
        <td style="text-align: right; font-weight: bold; color: #059669;">${subsidy}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte_Corte_Subsidios_${periodName.replace(/[^a-zA-Z0-9]/g, '_')}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 12mm;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
          color: #1e293b;
          margin: 0;
          padding: 0;
        }
        .header {
          background-color: #0f172a;
          color: #ffffff;
          padding: 16px 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-title {
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 0.5px;
        }
        .header-subtitle {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
        }
        .security-badge {
          background-color: rgba(2, 132, 199, 0.2);
          border: 1px solid #0284c7;
          color: #38bdf8;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 11px;
        }
        .metadata-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          margin: 16px 0;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
        }
        .metadata-item {
          font-size: 11px;
        }
        .metadata-item strong {
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        th {
          background-color: #0f172a;
          color: #ffffff;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 10px 8px;
          border: 1px solid #334155;
        }
        td {
          padding: 8px;
          border: 1px solid #e2e8f0;
          font-size: 10px;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        tfoot tr td {
          background-color: #0284c7;
          color: #ffffff;
          font-weight: bold;
          font-size: 11px;
          border: none;
        }
        .footer-note {
          margin-top: 20px;
          font-size: 9px;
          color: #94a3b8;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="header-title">TRACKFLEET 360</div>
          <div class="header-subtitle">REPORTE OFICIAL INVIOLABLE DE RECORRIDOS Y SUBSIDIOS DE FLOTA</div>
        </div>
        <div class="security-badge">
          🔒 DOCUMENTO CERTIFICADO Y NO MANIPULABLE
        </div>
      </div>

      <div class="metadata-box">
        <div class="metadata-item">
          <strong>Corte de Subsidio:</strong> ${periodName}<br/>
          <strong>Fecha de Emisión:</strong> ${todayStr}
        </div>
        <div class="metadata-item" style="text-align: right;">
          <strong>Emitido por:</strong> ${generatedBy}<br/>
          <strong>Total Recorridos:</strong> ${journeys.length} Viajes
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Destino</th>
            <th style="width: 10%;">Fecha</th>
            <th style="width: 10%;">Hora Inicio</th>
            <th style="width: 10%;">Hora Fin</th>
            <th style="width: 12%;">Odómetro Inicio</th>
            <th style="width: 12%;">Odómetro Final</th>
            <th style="width: 10%;">KM GPS (App)</th>
            <th style="width: 14%;">Conductor & Placa</th>
            <th style="width: 10%;">Subsidio (C$)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="padding: 10px;">TOTALES GENERALES CONSOLIDADOS DE SUBSIDIO</td>
            <td style="text-align: right; padding: 10px;">${totalGpsKm.toFixed(1)} KM</td>
            <td style="text-align: center; padding: 10px;">${journeys.length} Viajes</td>
            <td style="text-align: right; padding: 10px;">C$ ${totalSubsidy.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="footer-note">
        TrackFleet 360 © 2026 | Documento no manipulable generado automáticamente por el sistema de auditoría | Guardar como PDF
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
