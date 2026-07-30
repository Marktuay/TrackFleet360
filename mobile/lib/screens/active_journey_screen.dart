import 'dart:async';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class ActiveJourneyScreen extends StatefulWidget {
  final Journey journey;
  final Vehicle vehicle;

  const ActiveJourneyScreen({
    super.key,
    required this.journey,
    required this.vehicle,
  });

  @override
  State<ActiveJourneyScreen> createState() => _ActiveJourneyScreenState();
}

class _ActiveJourneyScreenState extends State<ActiveJourneyScreen> {
  final ApiService _apiService = ApiService();
  final _endKmController = TextEditingController();
  Timer? _timer;
  int _secondsElapsed = 0;
  int _gpsPointsCaptured = 5;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _endKmController.text = (widget.journey.startKm + 25.0).toString();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _secondsElapsed++;
          if (_secondsElapsed % 10 == 0) {
            _gpsPointsCaptured++;
            // Simulate periodic background GPS ping
            _apiService.sendGPSPoint(
              widget.journey.id,
              9.9333 + (_secondsElapsed * 0.0001),
              -84.0833 + (_secondsElapsed * 0.0001),
              45.0,
            );
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _endKmController.dispose();
    super.dispose();
  }

  String _formatDuration(int seconds) {
    final hours = (seconds ~/ 3600).toString().padLeft(2, '0');
    final minutes = ((seconds % 3600) ~/ 60).toString().padLeft(2, '0');
    final secs = (seconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$secs';
  }

  void _finishJourney() async {
    final endKm = double.tryParse(_endKmController.text) ?? widget.journey.startKm;
    setState(() {
      _isSubmitting = true;
    });

    final result = await _apiService.finishJourney(
      journeyId: widget.journey.id,
      endLat: 10.0167,
      endLng: -84.2167,
      endAddress: 'Alajuela Centro, Sucursal Norte',
      endKm: endKm,
      photoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
    );

    if (mounted) {
      _timer?.cancel();
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: const Text('Recorrido Finalizado', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Distancia Declarada: ${endKm - widget.journey.startKm} KM', style: const TextStyle(color: Colors.white)),
              const SizedBox(height: 4),
              Text('Distancia GPS: ${result['gps_dist_km']} KM', style: const TextStyle(color: Color(0xFF38BDF8))),
              const SizedBox(height: 4),
              Text('Diferencia: +${result['diff_km']} KM', style: const TextStyle(color: Colors.amberAccent)),
              const SizedBox(height: 12),
              if (result['is_flagged'] == true)
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.amber.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    '⚠️ El recorrido fue marcado para revisión por el supervisor debido a la diferencia de kilometraje.',
                    style: TextStyle(color: Colors.amber, fontSize: 12),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    '✅ Recorrido validado correctamente.',
                    style: TextStyle(color: Colors.lightGreenAccent, fontSize: 12),
                  ),
                )
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              },
              child: const Text('Aceptar', style: TextStyle(color: Color(0xFF38BDF8))),
            )
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Image.asset('assets/images/logo.png', height: 28, fit: BoxFit.contain),
            ),
            const SizedBox(width: 10),
            const Text('Recorrido en Curso', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Status Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF0369A1)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.fiber_manual_record, color: Color(0xFF10B981), size: 12),
                            SizedBox(width: 6),
                            Text('GPS Activo', style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      Text(
                        'Vehículo: ${widget.vehicle.plateNumber}',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    _formatDuration(_secondsElapsed),
                    style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                  ),
                  const Text('Tiempo Transcurrido', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          Text('$_gpsPointsCaptured', style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 20, fontWeight: FontWeight.bold)),
                          const Text('Puntos GPS', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                        ],
                      ),
                      Column(
                        children: [
                          Text('${widget.journey.startKm} KM', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                          const Text('KM Inicial', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Form end journey
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Finalizar Recorrido', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  const Text('Kilometraje Final de Odómetro (KM):', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _endKmController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.speed, color: Color(0xFF38BDF8)),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Fotografía del Odómetro (Opcional):', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Fotografía del odómetro capturada correctamente')),
                      );
                    },
                    icon: const Icon(Icons.camera_alt_outlined, color: Color(0xFF38BDF8)),
                    label: const Text('Tomar Foto de Odómetro', style: TextStyle(color: Colors.white)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF38BDF8)),
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: _isSubmitting ? null : _finishJourney,
                      icon: const Icon(Icons.stop_rounded, color: Colors.white),
                      label: const Text('Completar Recorrido', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEF4444),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.bolt, size: 12, color: Color(0xFF64748B)),
                  const SizedBox(width: 4),
                  RichText(
                    text: const TextSpan(
                      style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                      children: [
                        TextSpan(text: 'Powered by '),
                        TextSpan(
                          text: 'Newcentury',
                          style: TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
