import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class BookScreen extends StatelessWidget {
  final int serviceId; // Add service_id
  final String serviceName;
  final double serviceCost;
  final int userId;
  final TextEditingController addressController = TextEditingController();
  final TextEditingController noteController = TextEditingController();

  BookScreen({
    super.key,
    required this.serviceId,
    required this.serviceName,
    required this.serviceCost,
    required this.userId,
  });

  Future<void> _bookService(BuildContext context) async {
    final url = Uri.parse('http://localhost:3000/bookings');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'user_id': userId,
        'service_id': serviceId,
        'address': addressController.text,
        'note': noteController.text,
      }),
    );

    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Booking Successful!')),
      );
      Navigator.pop(context); // Go back after successful booking
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Booking Failed! Please try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Confirm $serviceName Request')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              'Service: $serviceName',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Text('Total Cost: \$${serviceCost.toStringAsFixed(2)}'),
            const SizedBox(height: 20),
            TextField(
              controller: addressController,
              decoration: const InputDecoration(labelText: 'Enter Address'),
            ),
            TextField(
              controller: noteController,
              decoration:
                  const InputDecoration(labelText: 'Enter Note (Optional)'),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: () => _bookService(context),
              child: const Text('Confirm Booking'),
            ),
          ],
        ),
      ),
    );
  }
}
