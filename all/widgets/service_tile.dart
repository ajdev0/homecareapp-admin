import 'package:flutter/material.dart';
import '../screens/book_screen.dart';

class ServiceTile extends StatelessWidget {
  final int serviceId; // Add service_id
  final String serviceName;
  final double serviceCost; // Add service cost
  final IconData icon;
  final int userId; // Add userId parameter

  const ServiceTile({
    super.key,
    required this.serviceId,
    required this.serviceName,
    required this.serviceCost,
    required this.icon,
    required this.userId, // Mark userId as required
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(30),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      elevation: 4,
      child: ListTile(
        leading: Icon(icon, size: 48, color: Colors.deepPurple),
        title: Text(serviceName,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        trailing: ElevatedButton(
          onPressed: () {
            // Navigate to Book Screen with the selected service
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => BookScreen(
                  serviceId: serviceId,
                  serviceName: serviceName,
                  serviceCost: serviceCost,
                  userId: userId,
                ),
              ),
            );
          },
          child: const Text(
            'Book Now',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
