import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

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
      home: const LoginScreen(),
    );
  }
}
