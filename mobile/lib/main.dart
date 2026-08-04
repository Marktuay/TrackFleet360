import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/vehicle_select_screen.dart';

void main() {
  runApp(const TrackFleetApp());
}

class TrackFleetApp extends StatelessWidget {
  const TrackFleetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TrackFleet360 Conductor',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFF0284C7),
        useMaterial3: true,
      ),
      home: const RootScreen(),
    );
  }
}

class RootScreen extends StatefulWidget {
  const RootScreen({super.key});

  @override
  State<RootScreen> createState() => _RootScreenState();
}

class _RootScreenState extends State<RootScreen> {
  final ApiService _apiService = ApiService();
  bool _checkingSession = true;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _checkSavedSession();
  }

  void _checkSavedSession() async {
    try {
      final token = await _apiService.getToken();
      if (token != null && token.isNotEmpty) {
        setState(() {
          _isLoggedIn = true;
          _checkingSession = false;
        });
        return;
      }
    } catch (e) {
      // Session expired or null
    }
    setState(() {
      _isLoggedIn = false;
      _checkingSession = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_checkingSession) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF38BDF8)),
        ),
      );
    }
    return _isLoggedIn ? const VehicleSelectScreen() : const LoginScreen();
  }
}
