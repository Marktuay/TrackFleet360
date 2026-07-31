import 'package:flutter/material.dart';
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

  // Mock data for Driver's Past Cutoff Subsidies Claim
  final String _cutoffName = "Corte Quincenal (1 a 15 de Julio 2026)";
  final String _driverName = "Jorge Mayorga";
  final String _licenseNo = "LIC-774920";
  final String _vehiclePlate = "MOTO-808-NI";
  final String _vehicleModel = "Yamaha FZ-25 250cc";
  final double _subsidyRate = 6.0; // 6 C$/km for motorcycles

  List<Map<String, dynamic>> _pastJourneys = [
    {
      "id": 101,
      "destino": "SINSA Altamira",
      "fecha": "02/07/2026",
      "hora_inicio": "08:15 AM",
      "hora_fin": "10:30 AM",
      "odo_inicio": 8500.0,
      "odo_fin": 8525.0,
      "km_gps": 24.8,
      "subsidio": 148.80,
    },
    {
      "id": 102,
      "destino": "Sucursal Linda Vista",
      "fecha": "08/07/2026",
      "hora_inicio": "01:00 PM",
      "hora_fin": "03:15 PM",
      "odo_inicio": 8525.0,
      "odo_fin": 8550.0,
      "km_gps": 25.0,
      "subsidio": 150.00,
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    // Simulate API fetch delay
    await Future.delayed(const Duration(milliseconds: 400));
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  double get _totalKm => _pastJourneys.fold(0.0, (sum, j) => sum + (j['km_gps'] as double));
  double get _totalSubsidy => _pastJourneys.fold(0.0, (sum, j) => sum + (j['subsidio'] as double));

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

  void _downloadPDFFile() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✓ Solicitud de Pago PDF (Corte Pasado) lista para $_driverName. Documento generado exitosamente.'),
        backgroundColor: const Color(0xFF10B981),
        duration: const Duration(seconds: 4),
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
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Conductor: $_driverName', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                Text('Vehículo: $_vehiclePlate ($_vehicleModel)', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                              ],
                            ),
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
