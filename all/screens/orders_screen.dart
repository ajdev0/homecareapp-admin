import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class OrdersScreen extends StatefulWidget {
  final int userId; // User ID to fetch their bookings

  const OrdersScreen({super.key, required this.userId});

  @override
  _OrdersScreenState createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<dynamic> bookings = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchBookings(); // Fetch bookings when the screen loads
  }

  // Fetch bookings from the backend
  Future<void> _fetchBookings() async {
    final url = Uri.parse('http://localhost:3000/bookings/${widget.userId}');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        setState(() {
          bookings = json.decode(response.body);
          isLoading = false;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load bookings')),
        );
      }
    } catch (e) {
      print('Error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('An error occurred. Please try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator()) // Show loading spinner
          : bookings.isEmpty
              ? const Center(child: Text('No bookings found.'))
              : ListView.builder(
                  itemCount: bookings.length,
                  itemBuilder: (context, index) {
                    final booking = bookings[index];
                    return Card(
                      margin: const EdgeInsets.all(8.0),
                      child: ListTile(
                        title: Text(booking['service_name']),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Address: ${booking['address']}'),
                            if (booking['note'] != null &&
                                booking['note'].isNotEmpty)
                              Text('Note: ${booking['note']}'),
                            Text('Total Cost: \$${booking['total_cost']}'),
                            Text('Date: ${booking['created_at']}'),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
