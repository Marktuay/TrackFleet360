import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class SubsidyClaimScreen extends StatefulWidget {
  const SubsidyClaimScreen({Key? key}) : super(key: key);

  @override
  State<SubsidyClaimScreen> createState() => _SubsidyClaimScreenState();
}

class _SubsidyClaimScreenState extends State<SubsidyClaimScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;

  final String _cutoffName = "Corte Quincenal (1 a 15 de Julio 2026)";
  String _driverName = "Conductor Registrado";
  final String _licenseNo = "LIC-NICA";
  String _vehiclePlate = "PLACA-PENDIENTE";
  String _vehicleModel = "Vehículo Corporativo";
  final double _subsidyRate = 6.0; // 6 C$/km for motorcycles

  List<Map<String, dynamic>> _pastJourneys = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    final userData = await _apiService.getUserData();
    if (userData != null && userData['full_name'] != null && userData['full_name'].toString().isNotEmpty) {
      _driverName = userData['full_name'];
    }

    final vehicles = await _apiService.getVehicles();
    if (vehicles.isNotEmpty) {
      _vehiclePlate = vehicles.first.plateNumber;
      _vehicleModel = "${vehicles.first.brand} ${vehicles.first.model}".trim();
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  double get _totalKm => _pastJourneys.fold(0.0, (sum, item) => sum + (item['km_gps'] as double));
  double get _totalSubsidy => _pastJourneys.fold(0.0, (sum, item) => sum + (item['subsidio'] as double));

  void _downloadPDFFile() async {
    try {
      final pdf = pw.Document();

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) {
            return pw.Padding(
              padding: const pw.EdgeInsets.all(24),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  // Header
                  pw.Container(
                    width: double.infinity,
                    padding: const pw.EdgeInsets.all(12),
                    decoration: const pw.BoxDecoration(
                      color: PdfColors.blueGrey900,
                    ),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                          'TRACKFLEET 360 - FORMATO OFICIAL',
                          style: pw.TextStyle(color: PdfColors.white, fontSize: 16, fontWeight: pw.FontWeight.bold),
                        ),
                        pw.SizedBox(height: 4),
                        pw.Text(
                          'SOLICITUD DE PAGO DE SUBSIDIO DE TRANSPORTE',
                          style: pw.TextStyle(color: PdfColors.white, fontSize: 13, fontWeight: pw.FontWeight.bold),
                        ),
                        pw.SizedBox(height: 4),
                        pw.Text(
                          'DOCUMENTO CERTIFICADO Y NO MANIPULABLE',
                          style: pw.TextStyle(color: PdfColors.tealAccent400, fontSize: 10, fontWeight: pw.FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  pw.SizedBox(height: 16),
                  pw.Text('Conductor: $_driverName | Licencia: $_licenseNo', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  pw.Text('Vehículo Asignado: $_vehiclePlate ($_vehicleModel)'),
                  pw.Text('Período de Corte: $_cutoffName | Tarifa: C\$ $_subsidyRate / KM'),
                  pw.SizedBox(height: 16),

                  // Table
                  pw.Table.fromTextArray(
                    headers: ['Destino', 'Fecha', 'Horario', 'Odómetros', 'KM GPS', 'Subsidio (C\$)'],
                    data: _pastJourneys.isNotEmpty
                        ? _pastJourneys.map((j) => [
                            j['destino'],
                            j['fecha'],
                            '${j['hora_inicio']} - ${j['hora_fin']}',
                            '${j['odo_inicio']} -> ${j['odo_fin']}',
                            '${j['km_gps']} KM',
                            'C\$ ${(j['subsidio'] as double).toStringAsFixed(2)}',
                          ]).toList()
                        : [
                            ['Sin Recorridos Registrados', 'Período Actual', 'N/A', '0.0 -> 0.0', '0.0 KM', 'C\$ 0.00']
                          ],
                    headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: PdfColors.white),
                    headerDecoration: const pw.BoxDecoration(color: PdfColors.blueGrey800),
                    rowDecoration: const pw.BoxDecoration(border: pw.Border(bottom: pw.BorderSide(color: PdfColors.grey300))),
                  ),
                  pw.SizedBox(height: 16),

                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('TOTAL KM: ${_totalKm.toStringAsFixed(1)} KM', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text('TOTAL SUBSIDIO: C\$ ${_totalSubsidy.toStringAsFixed(2)}', style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: PdfColors.green800)),
                    ],
                  ),
                  pw.SizedBox(height: 50),

                  // Signatures
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Column(
                        children: [
                          pw.Container(width: 180, height: 1, color: PdfColors.black),
                          pw.SizedBox(height: 4),
                          pw.Text('Firma del Conductor', style: const pw.TextStyle(fontSize: 10)),
                        ],
                      ),
                      pw.Column(
                        children: [
                          pw.Container(width: 180, height: 1, color: PdfColors.black),
                          pw.SizedBox(height: 4),
                          pw.Text('Aprobación Supervisión', style: const pw.TextStyle(fontSize: 10)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      );

      final bytes = await pdf.save();

      await Printing.sharePdf(
        bytes: bytes,
        filename: 'Solicitud_Pago_Subsidio_${_driverName.replaceAll(' ', '_')}.pdf',
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ Solicitud de Pago PDF generada para $_driverName.'),
            backgroundColor: const Color(0xFF10B981),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al generar PDF: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  void _generatePDFDocument() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.picture_as_pdf_rounded, color: Color(0xFFF43F5E), size: 24),
            SizedBox(width: 8),
            Expanded(
              child: Text(
                'Solicitud de Pago PDF',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Stamp
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'TRACKFLEET 360 - FORMATO OFICIAL',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                      Text(
                        'SOLICITUD DE PAGO DE SUBSIDIO DE TRANSPORTE',
                        style: TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 10),
                      ),
                      Text(
                        '🔒 DOCUMENTO CERTIFICADO Y NO MANIPULABLE',
                        style: TextStyle(color: Color(0xFF34D399), fontSize: 9),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Text('Conductor: $_driverName', style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                Text('Licencia: $_licenseNo', style: const TextStyle(color: Colors.black54, fontSize: 10)),
                Text('Vehículo: $_vehiclePlate ($_vehicleModel)', style: const TextStyle(color: Colors.black54, fontSize: 10)),
                Text('Período: $_cutoffName', style: const TextStyle(color: Colors.black54, fontSize: 10)),
                const Divider(height: 16, color: Colors.black26),
                const Text('Desglose de Recorridos Validados:', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                const SizedBox(height: 6),
                ..._pastJourneys.map((j) => Container(
                  margin: const EdgeInsets.only(bottom: 6),
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.black12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('📍 Destino: ${j['destino']}', style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 10)),
                      Text('📅 Fecha: ${j['fecha']} (${j['hora_inicio']} - ${j['hora_fin']})', style: const TextStyle(color: Colors.black87, fontSize: 9)),
                      Text('🚗 Odo: ${j['odo_inicio']} KM → ${j['odo_fin']} KM | GPS: ${j['km_gps']} KM', style: const TextStyle(color: Colors.black87, fontSize: 9)),
                      Text('💰 Subsidio: C\$ ${j['subsidio'].toStringAsFixed(2)}', style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 10)),
                    ],
                  ),
                )),
                const Divider(height: 16, color: Colors.black26),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('TOTAL A COBRAR:', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                    Text('C\$ ${_totalSubsidy.toStringAsFixed(2)}', style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 12),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('_____________________\nFirma Conductor', style: TextStyle(color: Colors.black54, fontSize: 9), textAlign: TextAlign.center),
                    Text('_____________________\nAprobación Supervisión', style: TextStyle(color: Colors.black54, fontSize: 9), textAlign: TextAlign.center),
                  ],
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cerrar', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(ctx);
              _downloadPDFFile();
            },
            icon: const Icon(Icons.download_rounded, size: 18, color: Colors.white),
            label: const Text('Descargar Archivo PDF', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0284C7),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Solicitud de Pago (Corte Pasado)',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
        ),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cutoff Header Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0284C7).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.receipt_long_rounded, color: Color(0xFF38BDF8), size: 22),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _cutoffName,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                  const Text(
                                    'Estado: Validado para Liquidación',
                                    style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Divider(color: Color(0xFF334155)),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Conductor: $_driverName', 
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    'Vehículo: $_vehiclePlate ($_vehicleModel)', 
                                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFF334155)),
                              ),
                              child: Text(
                                'Tarifa: C\$ $_subsidyRate / KM',
                                style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),
                  const Text(
                    'Recorridos Realizados en este Corte',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 10),

                  // Journeys List Cards
                  if (_pastJourneys.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: const Column(
                        children: [
                          Icon(Icons.assignment_outlined, color: Color(0xFF94A3B8), size: 36),
                          SizedBox(height: 10),
                          Text(
                            'No se registran recorridos finalizados en este corte.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Los viajes que realice en este período quincenal se acumularán automáticamente aquí.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Color(0xFF64748B), fontSize: 11),
                          ),
                        ],
                      ),
                    )
                  else
                    ..._pastJourneys.map((j) => Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.place_rounded, color: Color(0xFF34D399), size: 16),
                                  const SizedBox(width: 6),
                                  Text(
                                    j['destino'],
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                ],
                              ),
                              Text(
                                'C\$ ${(j['subsidio'] as double).toStringAsFixed(2)}',
                                style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '📅 Fecha: ${j['fecha']} | Horario: ${j['hora_inicio']} - ${j['hora_fin']}',
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Odómetro: ${j['odo_inicio']} KM → ${j['odo_fin']} KM',
                                style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                              ),
                              Text(
                                'GPS App: ${j['km_gps']} KM',
                                style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                    )),

                  const SizedBox(height: 16),

                  // Totals Summary Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF10B981).withOpacity(0.6), width: 1.5),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('TOTAL DE SUBSIDIO A COBRAR', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 2),
                            Text('${_pastJourneys.length} Viajes | ${_totalKm.toStringAsFixed(1)} KM Totales', style: const TextStyle(color: Colors.white, fontSize: 12)),
                          ],
                        ),
                        Text(
                          'C\$ ${_totalSubsidy.toStringAsFixed(2)}',
                          style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // PDF Claim Download Button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: _generatePDFDocument,
                      icon: const Icon(Icons.picture_as_pdf_rounded, color: Colors.white),
                      label: const Text(
                        '🔒 Descargar Solicitud de Pago PDF',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE11D48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
    );
  }
}
