import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'active_journey_screen.dart';
import 'subsidy_claim_screen.dart';
import 'login_screen.dart';

class VehicleSelectScreen extends StatefulWidget {
  const VehicleSelectScreen({super.key});

  @override
  State<VehicleSelectScreen> createState() => _VehicleSelectScreenState();
}

class _VehicleSelectScreenState extends State<VehicleSelectScreen> {
  final ApiService _apiService = ApiService();
  final ImagePicker _picker = ImagePicker();
  List<Vehicle> _vehicles = [];
  bool _isLoading = true;
  Vehicle? _selectedVehicle;
  final _startKmController = TextEditingController();
  final _destinationController = TextEditingController();
  XFile? _odometerPhoto;

  @override
  void initState() {
    super.initState();
    _loadVehicles();
  }

  void _confirmLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.logout_rounded, color: Color(0xFFF43F5E)),
            SizedBox(width: 8),
            Text('Cerrar Sesión', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        content: const Text(
          '¿Está seguro de que desea cerrar la sesión en este dispositivo?',
          style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await _apiService.logout();
              if (mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF43F5E)),
            child: const Text('Cerrar Sesión', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
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

  Future<Position?> _getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        await Geolocator.openLocationSettings();
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return null;
      }

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      return null;
    }
  }

  Future<void> _takeOdometerPhoto() async {
    try {
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
        maxWidth: 1200,
      );
      if (photo != null) {
        setState(() {
          _odometerPhoto = photo;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al acceder a la cámara: $e'),
            backgroundColor: const Color(0xFFE11D48),
          ),
        );
      }
    }
  }

  void _startJourney() async {
    if (_selectedVehicle == null) return;

    final destination = _destinationController.text.trim();
    if (destination.isEmpty) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.place_rounded, color: Color(0xFFF59E0B)),
              SizedBox(width: 8),
              Text('Destino Requerido', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          content: const Text(
            'Por favor escriba el destino del recorrido antes de iniciar (ejemplo: SINSA Altamira).',
            style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13),
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
              child: const Text('Entendido', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
      return;
    }

    // STRICT CHECK: Photo of odometer is mandatory to start journey!
    if (_odometerPhoto == null) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.camera_alt_rounded, color: Color(0xFFF43F5E)),
              SizedBox(width: 8),
              Text('Fotografía Requerida', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          content: const Text(
            'Es OBLIGATORIO tomar la foto del odómetro del vehículo antes de iniciar el recorrido.\n\nPor favor active la cámara para capturar la evidencia visual.',
            style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar', style: TextStyle(color: Color(0xFF94A3B8))),
            ),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(ctx);
                _takeOdometerPhoto();
              },
              icon: const Icon(Icons.camera_alt, size: 18, color: Colors.white),
              label: const Text('Tomar Foto Ahora', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
              ),
            ),
          ],
        ),
      );
      return; // DO NOT PROCEED!
    }

    final km = double.tryParse(_startKmController.text) ?? _selectedVehicle!.currentKm;

    // Fetch REAL GPS location
    final position = await _getCurrentLocation();
    final lat = position?.latitude ?? 12.1364; // Default Managua, Nicaragua coordinates
    final lng = position?.longitude ?? -86.2514;

    final journey = await _apiService.startJourney(
      vehicleId: _selectedVehicle!.id,
      destination: destination,
      startLat: lat,
      startLng: lng,
      startAddress: 'Punto de Inicio (GPS Activo)',
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
        titleSpacing: 12,
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Image.asset('assets/images/logo.png', height: 26, fit: BoxFit.contain),
            ),
            const SizedBox(width: 8),
            const Expanded(
              child: Text(
                'Inicio de Viaje (v1.5)',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Solicitud de Pago PDF (Corte Pasado)',
            icon: const Icon(Icons.picture_as_pdf_rounded, color: Color(0xFFF43F5E), size: 22),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SubsidyClaimScreen()),
              );
            },
          ),
          IconButton(
            tooltip: 'Cerrar Sesión',
            icon: const Icon(Icons.logout_rounded, color: Color(0xFF94A3B8), size: 22),
            onPressed: _confirmLogout,
          ),
          const SizedBox(width: 4),
        ],
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0284C7)))
          : SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                  // Banner button for PDF Subsidies Payment Request (Corte Pasado)
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const SubsidyClaimScreen()),
                      );
                    },
                    child: Container(
                      width: double.infinity,
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFF43F5E).withOpacity(0.6), width: 1.5),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.picture_as_pdf_rounded, color: Color(0xFFF43F5E), size: 22),
                          SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '📄 Solicitud de Pago (Corte Pasado)',
                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                Text(
                                  'Descargar formulario PDF para cobro de subsidio',
                                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                        ],
                      ),
                    ),
                  ),

                  const Text(
                    'Seleccione el vehículo asignado para el recorrido:',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                  ),
                  const SizedBox(height: 12),
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
                                  child: Icon(
                                    v.brand.toLowerCase().contains('yamaha') ? Icons.two_wheeler : Icons.directions_car,
                                    color: const Color(0xFF38BDF8),
                                    size: 28,
                                  ),
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
                  const SizedBox(height: 12),

                  // Destination Input Section (Texto Libre)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.place_outlined, color: Color(0xFF38BDF8), size: 18),
                            SizedBox(width: 6),
                            Text('Destino del Recorrido', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                            Text(' *', style: TextStyle(color: Color(0xFFFB7185), fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _destinationController,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: InputDecoration(
                            hintText: 'Ej: SINSA Altamira, Sucursal Linda Vista...',
                            hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                            filled: true,
                            fillColor: const Color(0xFF0F172A),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Mandatory Camera Photo Card Section
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      border: Border.all(
                        color: _odometerPhoto != null ? const Color(0xFF10B981) : const Color(0xFFF43F5E).withOpacity(0.6),
                        width: 1.5,
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Foto Odómetro Inicial',
                              style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: _odometerPhoto != null ? const Color(0xFF10B981).withOpacity(0.2) : const Color(0xFFF43F5E).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                _odometerPhoto != null ? '✓ TOMADA' : '* REQUERIDO',
                                style: TextStyle(
                                  color: _odometerPhoto != null ? const Color(0xFF34D399) : const Color(0xFFFB7185),
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        if (_odometerPhoto != null)
                          Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.file(
                                  File(_odometerPhoto!.path),
                                  width: 56,
                                  height: 56,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Evidencia Capturada', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                                    Text('Imagen lista para auditoría de odómetro', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                                  ],
                                ),
                              ),
                              OutlinedButton.icon(
                                onPressed: _takeOdometerPhoto,
                                icon: const Icon(Icons.refresh, size: 16, color: Color(0xFF38BDF8)),
                                label: const Text('Repetir', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 12)),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Color(0xFF38BDF8)),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                ),
                              ),
                            ],
                          )
                        else
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _takeOdometerPhoto,
                              icon: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 20),
                              label: const Text('Activar Cámara y Tomar Foto', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0284C7),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),
                  const Text(
                    'Kilometraje Inicial del Odómetro (KM):',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
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
                      contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                    ),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      onPressed: _startJourney,
                      icon: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 24),
                      label: const Text('Iniciar Recorrido', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _odometerPhoto != null ? const Color(0xFF10B981) : const Color(0xFF475569),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
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
          ),
    );
  }
}
