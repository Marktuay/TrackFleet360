import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'active_journey_screen.dart';

class VehicleSelectScreen extends StatefulWidget {
  const VehicleSelectScreen({super.key});

  @override
  State<VehicleSelectScreen> createState() => _VehicleSelectScreenState();
}

class _VehicleSelectScreenState extends State<VehicleSelectScreen> {
  final ApiService _apiService = ApiService();
  List<Vehicle> _vehicles = [];
  bool _isLoading = true;
  Vehicle? _selectedVehicle;
  final _startKmController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadVehicles();
  }

  void _loadVehicles() async {
    final list = await _apiService.getVehicles();
    setState(() {
      _vehicles = list;
      if (list.isNotEmpty) {
        _selectedVehicle = list.first;
        _startKmController.text = list.first.currentKm.toString();
      }
      _isLoading = false;
    });
  }

  void _startJourney() async {
    if (_selectedVehicle == null) return;
    final km = double.tryParse(_startKmController.text) ?? _selectedVehicle!.currentKm;

    final journey = await _apiService.startJourney(
      vehicleId: _selectedVehicle!.id,
      startLat: 9.9333,
      startLng: -84.0833,
      startAddress: 'San José Centro, Estación Principal',
      startKm: km,
    );

    if (mounted && journey != null) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => ActiveJourneyScreen(
            journey: journey,
            vehicle: _selectedVehicle!,
          ),
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
            const Text('Selección de Vehículo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0284C7)))
          : Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Seleccione el vehículo asignado para el recorrido:',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _vehicles.length,
                      itemBuilder: (context, index) {
                        final v = _vehicles[index];
                        final isSelected = _selectedVehicle?.id == v.id;
                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedVehicle = v;
                              _startKmController.text = v.currentKm.toString();
                            });
                          },
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF0369A1).withOpacity(0.3) : const Color(0xFF1E293B),
                              border: Border.all(
                                color: isSelected ? const Color(0xFF38BDF8) : const Color(0xFF334155),
                                width: isSelected ? 2 : 1,
                              ),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0F172A),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(Icons.directions_car, color: Color(0xFF38BDF8), size: 28),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Placa: ${v.plateNumber}',
                                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                                      ),
                                      Text(
                                        '${v.brand} ${v.model}',
                                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Odómetro: ${v.currentKm} KM',
                                        style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 12, fontWeight: FontWeight.w600),
                                      ),
                                    ],
                                  ),
                                ),
                                if (isSelected)
                                  const Icon(Icons.check_circle_rounded, color: Color(0xFF38BDF8), size: 24),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Kilometraje Inicial del Odómetro (KM):',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _startKmController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.speed, color: Color(0xFF38BDF8)),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: _startJourney,
                      icon: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 24),
                      label: const Text('Iniciar Recorrido', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
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
