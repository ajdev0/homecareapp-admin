import 'package:flutter/material.dart';
import 'package:home_care_app/screens/HomeContent.dart';
import 'profile_screen.dart'; // Import the Profile Screen

class HomeScreen extends StatefulWidget {
  final int userId; // Pass the user ID from login

  const HomeScreen({super.key, required this.userId});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0; // Track the selected tab index

  // Screens to display for each tab
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();

    // Initialize the screens with the user ID passed
    _screens = [
      HomeContent(userId: widget.userId), // Pass user ID to HomeContent
      ProfileScreen(userId: widget.userId), // Profile Screen with user ID
    ];
  }

  // Handle tab selection
  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex], // Display the selected screen
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex, // Highlight selected tab
        onTap: _onItemTapped, // Handle tap events
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
