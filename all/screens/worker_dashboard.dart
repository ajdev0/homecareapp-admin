import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class WorkerDashboard extends StatefulWidget {
  final int userId;

  const WorkerDashboard({super.key, required this.userId});

  @override
  _WorkerDashboardState createState() => _WorkerDashboardState();
}

class _WorkerDashboardState extends State<WorkerDashboard> {
  List<dynamic> assignedTasks = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAssignedTasks(); // Fetch tasks when the screen loads
  }

  // Fetch assigned tasks for the worker
  Future<void> _fetchAssignedTasks() async {
    final url =
        Uri.parse('http://localhost:3000/worker/${widget.userId}/bookings');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        setState(() {
          assignedTasks = json.decode(response.body);
          isLoading = false;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load tasks')),
        );
      }
    } catch (e) {
      print('Error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('An error occurred. Please try again.')),
      );
    }
  }

  // Update the status of a booking
  Future<void> _updateBookingStatus(int bookingId, String status) async {
    final url = Uri.parse(
        'http://localhost:3000/worker/${widget.userId}/bookings/$bookingId/status');

    try {
      final response = await http.put(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'status': status}),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Status updated successfully!')),
        );
        _fetchAssignedTasks(); // Refresh the list
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update status')),
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
      appBar: AppBar(title: const Text('Worker Dashboard')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : assignedTasks.isEmpty
              ? const Center(child: Text('No tasks assigned yet.'))
              : ListView.builder(
                  itemCount: assignedTasks.length,
                  itemBuilder: (context, index) {
                    final task = assignedTasks[index];
                    return Card(
                      margin: const EdgeInsets.all(10),
                      child: ListTile(
                        title: Text(task['service_name']),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                                'Customer: ${task['user_first_name']} ${task['user_last_name']}'),
                            Text('Address: ${task['address']}'),
                            Text('Status: ${task['status']}'),
                            Text('Total Cost: \$${task['total_cost']}'),
                          ],
                        ),
                        trailing: PopupMenuButton<String>(
                          onSelected: (value) {
                            _updateBookingStatus(task['id'], value);
                          },
                          itemBuilder: (BuildContext context) {
                            return ['active', 'completed', 'cancelled']
                                .map((status) => PopupMenuItem<String>(
                                      value: status,
                                      child: Text('Mark as $status'),
                                    ))
                                .toList();
                          },
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
