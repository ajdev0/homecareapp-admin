import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class EditProfileScreen extends StatefulWidget {
  final int userId;

  const EditProfileScreen({super.key, required this.userId});

  @override
  _EditProfileScreenState createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final TextEditingController firstNameController = TextEditingController();
  final TextEditingController lastNameController = TextEditingController();
  final TextEditingController mobileController = TextEditingController();
  final TextEditingController addressController = TextEditingController();
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProfileData(); // Fetch user data when the screen loads
  }

  // Fetch the user's current profile data from the backend
  Future<void> _fetchProfileData() async {
    final url = Uri.parse('http://localhost:3000/profile/${widget.userId}');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          firstNameController.text = data['first_name'];
          lastNameController.text = data['last_name'];
          mobileController.text = data['mobile_number'];
          addressController.text = data['address'];
          isLoading = false; // Stop loading spinner once data is loaded
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load profile data')),
        );
      }
    } catch (e) {
      print('Error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('An error occurred. Please try again.')),
      );
    }
  }

  // Handle profile update request
  Future<void> _updateProfile(BuildContext context) async {
    final url = Uri.parse('http://localhost:3000/profile/${widget.userId}');

    final response = await http.put(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'first_name': firstNameController.text,
        'last_name': lastNameController.text,
        'mobile_number': mobileController.text,
        'address': addressController.text,
      }),
    );

    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully!')),
      );
      Navigator.pop(context); // Go back to the Profile screen
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update profile')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator()) // Show loading spinner
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  TextField(
                    controller: firstNameController,
                    decoration: const InputDecoration(labelText: 'First Name'),
                  ),
                  TextField(
                    controller: lastNameController,
                    decoration: const InputDecoration(labelText: 'Last Name'),
                  ),
                  TextField(
                    controller: mobileController,
                    decoration:
                        const InputDecoration(labelText: 'Mobile Number'),
                  ),
                  TextField(
                    controller: addressController,
                    decoration: const InputDecoration(labelText: 'Address'),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => _updateProfile(context),
                    child: const Text('Update Profile'),
                  ),
                ],
              ),
            ),
    );
  }
}
