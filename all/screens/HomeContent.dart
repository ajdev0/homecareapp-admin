import 'package:flutter/material.dart';
import 'package:home_care_app/widgets/service_tile.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class HomeContent extends StatelessWidget {
  final int userId;

  const HomeContent({super.key, required this.userId});

  Future<List<dynamic>> _fetchServices() async {
    final response =
        await http.get(Uri.parse('http://localhost:3000/services'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load services');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Available Services')),
      body: FutureBuilder<List<dynamic>>(
        future: _fetchServices(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No services available'));
          } else {
            final services = snapshot.data!;
            return ListView.builder(
              itemCount: services.length,
              itemBuilder: (context, index) {
                final service = services[index];
                return ServiceTile(
                  serviceId: service['id'], // Pass service_id to ServiceTile
                  serviceName: service['service_name'], // Pass service name
                  serviceCost: service['cost'], // Pass service cost
                  icon: Icons
                      .build, // You can customize icons based on service type
                  userId: userId, // Pass user ID for booking
                );
              },
            );
          }
        },
      ),
    );
  }
}
