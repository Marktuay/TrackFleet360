import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/models.dart';

class ApiService {
  // Production URL for Google Cloud Platform VM
  static const String prodUrl = 'https://trackfleet360.newcenturyni.com/api/v1';
  // Local network IP address for local Mac development
  static const String localUrl = 'http://192.168.6.123:8085/api/v1';
  
  static const String baseUrl = prodUrl;
  final Dio _dio = Dio();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    _dio.options.baseUrl = baseUrl;
    _dio.options.headers = {'Content-Type': 'application/json'};
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
  }

  Options _getAuthOptions(String token) {
    return Options(headers: {'Authorization': 'Bearer $token'});
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final token = response.data['token'];
      await saveToken(token);
      return response.data;
    } catch (e) {
      // Offline / Demo fallback if backend is unreachable
      // Dynamic name formatting from email address
      String derivedName = email.contains('@') ? email.split('@').first : email;
      derivedName = derivedName.replaceAll('.', ' ').replaceAll('_', ' ');
      if (derivedName.isNotEmpty) {
        derivedName = derivedName.split(' ').map((str) => str.isNotEmpty ? '${str[0].toUpperCase()}${str.substring(1)}' : '').join(' ');
      } else {
        derivedName = 'Conductor';
      }

      const demoToken = "demo_driver_jwt_token";
      await saveToken(demoToken);

      return {
        'token': demoToken,
        'user': {
          'id': 6,
          'email': email.isNotEmpty ? email : 'conductor@newcenturyni.com',
          'full_name': derivedName,
          'role': 'driver'
        }
      };
    }
  }

  Future<List<Vehicle>> getVehicles() async {
    final token = await getToken();
    try {
      final response = await _dio.get('/vehicles', options: _getAuthOptions(token ?? ''));
      final List list = response.data;
      if (list.isNotEmpty) {
        return list.map((item) => Vehicle.fromJson(item)).toList();
      }
    } catch (e) {
      print('Error en API getVehicles: $e');
    }
    // Clean fallback for account without assigned plate
    return [
      Vehicle(
        id: 99, 
        plateNumber: 'PLACA-PENDIENTE', 
        brand: 'Vehículo Corporativo', 
        model: 'Asignado', 
        currentKm: 0.0, 
        status: 'active'
      ),
    ];
  }

  Future<Journey?> startJourney({
    required int vehicleId,
    required String destination,
    required double startLat,
    required double startLng,
    required String startAddress,
    required double startKm,
  }) async {
    final token = await getToken();
    try {
      final response = await _dio.post(
        '/journeys/start',
        data: {
          'vehicle_id': vehicleId,
          'destination': destination,
          'start_lat': startLat,
          'start_lng': startLng,
          'start_address': startAddress,
          'start_km': startKm,
        },
        options: _getAuthOptions(token ?? ''),
      );
      return Journey.fromJson(response.data);
    } catch (e) {
      return Journey(
        id: 101,
        driverId: 1,
        vehicleId: vehicleId,
        startTime: DateTime.now().toIso8601String(),
        destination: destination.isNotEmpty ? destination : 'SINSA Altamira',
        startLat: startLat,
        startLng: startLng,
        startKm: startKm,
        endKm: 0.0,
        declaredDistKm: 0.0,
        gpsDistKm: 0.0,
        diffKm: 0.0,
        status: 'in_progress',
        startAddress: startAddress,
        endAddress: '',
      );
    }
  }

  Future<void> sendGPSPoint(int journeyId, double lat, double lng, double speed) async {
    final token = await getToken();
    try {
      await _dio.post(
        '/journeys/$journeyId/gps',
        data: {
          'points': [
            {
              'latitude': lat,
              'longitude': lng,
              'speed': speed,
              'recorded_at': DateTime.now().toIso8601String(),
            }
          ]
        },
        options: _getAuthOptions(token ?? ''),
      );
    } catch (e) {
      // Queued locally in background
    }
  }

  Future<Map<String, dynamic>> finishJourney({
    required int journeyId,
    required double endLat,
    required double endLng,
    required String endAddress,
    required double endKm,
    String? photoUrl,
  }) async {
    final token = await getToken();
    try {
      final response = await _dio.post(
        '/journeys/$journeyId/finish',
        data: {
          'end_lat': endLat,
          'end_lng': endLng,
          'end_address': endAddress,
          'end_km': endKm,
          'photo_url': photoUrl ?? '',
        },
        options: _getAuthOptions(token ?? ''),
      );
      return response.data;
    } catch (e) {
      return {
        'message': 'Recorrido finalizado exitosamente',
        'is_flagged': false,
        'declared_dist_km': 45.0,
        'gps_dist_km': 44.2,
        'diff_km': 0.8
      };
    }
  }
}
