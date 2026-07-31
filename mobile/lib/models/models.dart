import 'dart:convert';

class User {
  final int id;
  final String email;
  final String fullName;
  final String role;

  User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? '',
      role: json['role'] ?? 'driver',
    );
  }
}

class Vehicle {
  final int id;
  final String plateNumber;
  final String brand;
  final String model;
  final double currentKm;
  final String status;

  Vehicle({
    required this.id,
    required this.plateNumber,
    required this.brand,
    required this.model,
    required this.currentKm,
    required this.status,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] ?? 0,
      plateNumber: json['plate_number'] ?? '',
      brand: json['brand'] ?? '',
      model: json['model'] ?? '',
      currentKm: (json['current_km'] ?? 0.0).toDouble(),
      status: json['status'] ?? 'active',
    );
  }
}

class Journey {
  final int id;
  final int driverId;
  final int vehicleId;
  final String startTime;
  final String? endTime;
  final String destination;
  final double startLat;
  final double startLng;
  final double startKm;
  final double endKm;
  final double declaredDistKm;
  final double gpsDistKm;
  final double diffKm;
  final String status;
  final String startAddress;
  final String endAddress;

  Journey({
    required this.id,
    required this.driverId,
    required this.vehicleId,
    required this.startTime,
    this.endTime,
    required this.destination,
    required this.startLat,
    required this.startLng,
    required this.startKm,
    required this.endKm,
    required this.declaredDistKm,
    required this.gpsDistKm,
    required this.diffKm,
    required this.status,
    required this.startAddress,
    required this.endAddress,
  });

  factory Journey.fromJson(Map<String, dynamic> json) {
    return Journey(
      id: json['id'] ?? 0,
      driverId: json['driver_id'] ?? 0,
      vehicleId: json['vehicle_id'] ?? 0,
      startTime: json['start_time'] ?? '',
      endTime: json['end_time'],
      destination: json['destination'] ?? 'Destino General',
      startLat: (json['start_lat'] ?? 12.1364).toDouble(),
      startLng: (json['start_lng'] ?? -86.2514).toDouble(),
      startKm: (json['start_km'] ?? 0.0).toDouble(),
      endKm: (json['end_km'] ?? 0.0).toDouble(),
      declaredDistKm: (json['declared_dist_km'] ?? 0.0).toDouble(),
      gpsDistKm: (json['gps_dist_km'] ?? 0.0).toDouble(),
      diffKm: (json['diff_km'] ?? 0.0).toDouble(),
      status: json['status'] ?? 'in_progress',
      startAddress: json['start_address'] ?? '',
      endAddress: json['end_address'] ?? '',
    );
  }
}
