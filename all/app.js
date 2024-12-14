const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt"); // For password hashing

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "home_care",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Route: User Signup
app.post("/signup", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    mobile_number,
    address,
    role,
  } = req.body;

  if (!["user", "worker"].includes(role)) {
    return res.status(400).json({ message: "Invalid role specified" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (first_name, last_name, email, password, mobile_number, address, role) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      first_name,
      last_name,
      email,
      hashedPassword,
      mobile_number,
      address,
      role,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        res.status(500).json({ message: "Signup failed" });
      } else {
        res.status(200).json({ message: `${role} signed up successfully` });
      }
    }
  );
});

// Route: User Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Login failed" });
    } else if (results.length === 0) {
      res.status(401).json({ message: "Invalid email or password" });
    } else {
      const user = results[0];

      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        res.status(200).json({ message: "Login successful", user });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    }
  });
});

// Change Password Route
app.put("/change-password/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { current_password, new_password } = req.body;

  try {
    // Step 1: Get the user's current password from the database
    const query = "SELECT password FROM users WHERE id = ?";
    db.query(query, [user_id], async (err, results) => {
      if (err) {
        console.error("Error fetching user password:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];

      // Step 2: Compare the current password with the one in the database
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      // Step 3: Hash the new password and update it in the database
      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      const updateQuery = "UPDATE users SET password = ? WHERE id = ?";

      db.query(updateQuery, [hashedNewPassword, user_id], (err, result) => {
        if (err) {
          console.error("Error updating password:", err);
          return res.status(500).json({ message: "Failed to update password" });
        }
        res.status(200).json({ message: "Password updated successfully" });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});
//booking

app.post("/book", (req, res) => {
  const { user_id, service_name, address, note, total_cost } = req.body;

  const query = `
      INSERT INTO bookings (user_id, service_name, address, note, total_cost) 
      VALUES (?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [user_id, service_name, address, note, total_cost],
    (err, result) => {
      if (err) {
        console.error("Error inserting booking:", err);
        res.status(500).json({ message: "Booking failed" });
      } else {
        res
          .status(200)
          .json({ message: "Booking successful", booking_id: result.insertId });
      }
    }
  );
});
// Fetch all bookings
// Fetch all bookings with status
app.get("/bookings", (req, res) => {
  const query = `
    SELECT bookings.*, 
           users.first_name AS user_first_name, 
           users.last_name AS user_last_name, 
           workers.first_name AS worker_first_name, 
           workers.last_name AS worker_last_name 
    FROM bookings
    LEFT JOIN users ON bookings.user_id = users.id
    LEFT JOIN users AS workers ON bookings.worker_id = workers.id
    ORDER BY bookings.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ message: "Failed to load bookings" });
    } else {
      res.status(200).json(results);
    }
  });
});

//all bookings
app.get("/bookings/:user_id", (req, res) => {
  const { user_id } = req.params;

  const query = `
      SELECT bookings.id, bookings.service_name, bookings.address, bookings.note, bookings.total_cost, bookings.status, bookings.created_at,
             workers.first_name AS worker_first_name, workers.last_name AS worker_last_name
      FROM bookings
      LEFT JOIN users AS workers ON bookings.worker_id = workers.id
      WHERE bookings.user_id = ?
      ORDER BY bookings.created_at DESC
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ message: "Failed to load bookings" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Create a new booking and assign a worker
// Create a new booking
app.post("/bookings", (req, res) => {
  const { user_id, service_id, address, note } = req.body;

  // Fetch the service details based on service_id
  const serviceQuery = "SELECT * FROM services WHERE id = ?";
  db.query(serviceQuery, [service_id], (err, serviceResults) => {
    if (err || serviceResults.length === 0) {
      console.error("Error fetching service details:", err);
      return res.status(500).json({ message: "Service not found" });
    }

    const service = serviceResults[0];
    const totalCost = service.cost; // Use cost from service details

    // Find an available worker for the service
    const workerQuery = `
      SELECT id 
      FROM users 
      WHERE role = 'worker' AND approved = TRUE 
      AND (SELECT COUNT(*) FROM bookings WHERE bookings.worker_id = users.id AND bookings.status = 'active') < 5 
      LIMIT 1
    `;

    db.query(workerQuery, (err, workerResults) => {
      if (err || workerResults.length === 0) {
        console.error("Error finding worker:", err);
        return res.status(500).json({ message: "No available workers found" });
      }

      const worker_id = workerResults[0].id;

      // Insert the booking with default status = 'pending'
      const bookingQuery = `
        INSERT INTO bookings (user_id, service_id, service_name, address, note, total_cost, worker_id, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `;
      db.query(
        bookingQuery,
        [
          user_id,
          service_id,
          service.name,
          address,
          note,
          totalCost,
          worker_id,
        ],
        (err, result) => {
          if (err) {
            console.error("Error creating booking:", err);
            return res
              .status(500)
              .json({ message: "Failed to create booking" });
          }
          res.status(200).json({
            message: "Booking created successfully",
            booking_id: result.insertId,
          });
        }
      );
    });
  });
});

// Update booking status
app.put("/bookings/:booking_id/status", (req, res) => {
  const { booking_id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "active", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const query = `
    UPDATE bookings 
    SET status = ? 
    WHERE id = ?
  `;

  db.query(query, [status, booking_id], (err, result) => {
    if (err) {
      console.error("Error updating booking status:", err);
      return res
        .status(500)
        .json({ message: "Failed to update booking status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking status updated successfully" });
  });
});

//profile
//get user details
app.get("/profile/:user_id", (req, res) => {
  const { user_id } = req.params;

  const query =
    "SELECT first_name, last_name, email, mobile_number, address FROM users WHERE id = ?";
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching profile:", err);
      res.status(500).json({ message: "Failed to fetch profile" });
    } else if (results.length === 0) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

//update user
app.put("/profile/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { first_name, last_name, mobile_number, address } = req.body;

  const query = `
      UPDATE users 
      SET first_name = ?, last_name = ?, mobile_number = ?, address = ? 
      WHERE id = ?
    `;

  db.query(
    query,
    [first_name, last_name, mobile_number, address, user_id],
    (err, result) => {
      if (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Failed to update profile" });
      } else {
        res.status(200).json({ message: "Profile updated successfully" });
      }
    }
  );
});

// Fetch all bookings for a worker
app.get("/worker/:worker_id/bookings", (req, res) => {
  const { worker_id } = req.params;

  const query = `
    SELECT bookings.*, users.first_name AS user_first_name, users.last_name AS user_last_name 
    FROM bookings 
    LEFT JOIN users ON bookings.user_id = users.id 
    WHERE bookings.worker_id = ? 
    ORDER BY bookings.created_at DESC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching bookings for worker:", err);
      res.status(500).json({ message: "Failed to fetch bookings" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Update booking status by worker
app.put("/worker/:worker_id/bookings/:booking_id/status", (req, res) => {
  const { worker_id, booking_id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "active", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const query = `
    UPDATE bookings 
    SET status = ? 
    WHERE id = ? AND worker_id = ?
  `;

  db.query(query, [status, booking_id, worker_id], (err, result) => {
    if (err) {
      console.error("Error updating booking status:", err);
      res.status(500).json({ message: "Failed to update status" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: "Booking not found or unauthorized" });
    } else {
      res.status(200).json({ message: "Booking status updated successfully" });
    }
  });
});

// Admin Routes for CRUD Operations
// Admin Login Route
app.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  // Query to fetch the admin user (id = 1)
  const query = "SELECT * FROM users WHERE email = ? AND id = 1";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error fetching admin user:", err);
      res.status(500).json({ message: "Login failed" });
    } else if (results.length === 0) {
      res.status(401).json({ message: "Invalid email or password for admin" });
    } else {
      const admin = results[0];

      // Compare hashed password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        res.status(200).json({ message: "Admin login successful", admin });
      } else {
        res
          .status(401)
          .json({ message: "Invalid email or password for admin" });
      }
    }
  });
});

// Fetch all users
app.get("/admin/users", (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Add a new user
app.post("/admin/users", (req, res) => {
  const { first_name, last_name, email, password, mobile_number, address } =
    req.body;
  const hashedPassword = bcrypt.hashSync(password, 10); // Hash password
  const query = `
    INSERT INTO users (first_name, last_name, email, password, mobile_number, address) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(
    query,
    [first_name, last_name, email, hashedPassword, mobile_number, address],
    (err, result) => {
      if (err) {
        console.error("Error adding user:", err);
        res.status(500).json({ message: "Failed to add user" });
      } else {
        res.status(200).json({ message: "User added successfully" });
      }
    }
  );
});

// Update a user
app.put("/admin/users/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { first_name, last_name, mobile_number, address } = req.body;
  const query = `
    UPDATE users 
    SET first_name = ?, last_name = ?, mobile_number = ?, address = ? 
    WHERE id = ?
  `;
  db.query(
    query,
    [first_name, last_name, mobile_number, address, user_id],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Failed to update user" });
      } else {
        res.status(200).json({ message: "User updated successfully" });
      }
    }
  );
});

// Delete a user
app.delete("/admin/users/:user_id", (req, res) => {
  const { user_id } = req.params;
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [user_id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ message: "Failed to delete user" });
    } else {
      res.status(200).json({ message: "User deleted successfully" });
    }
  });
});

// Fetch all services
app.get("/admin/services", (req, res) => {
  const query = "SELECT * FROM services";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching services:", err);
      res.status(500).json({ message: "Failed to fetch services" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Add a new service and assign it to a worker with < 5 active bookings
app.post("/admin/services", (req, res) => {
  const { service_name, description, cost } = req.body;

  // Find a worker with fewer than 5 active bookings
  const workerQuery = `
    SELECT id 
    FROM workers 
    WHERE (SELECT COUNT(*) FROM bookings WHERE bookings.worker_id = workers.id AND bookings.status = 'active') < 5 
    LIMIT 1
  `;

  db.query(workerQuery, (err, workers) => {
    if (err || workers.length === 0) {
      console.error("Error finding worker:", err);
      return res.status(500).json({ message: "No available workers found" });
    }

    const worker_id = workers[0].id;

    // Insert the new service and assign it to the worker
    const serviceQuery = `
      INSERT INTO services (service_name, description, cost, worker_id) 
      VALUES (?, ?, ?, ?)
    `;
    db.query(
      serviceQuery,
      [service_name, description, cost, worker_id],
      (err, result) => {
        if (err) {
          console.error("Error adding service:", err);
          return res.status(500).json({ message: "Failed to add service" });
        }
        res.status(200).json({
          message: "Service added successfully and assigned to a worker",
        });
      }
    );
  });
});

// Additional CRUD routes for bookings and workers...
// Fetch all workers
// Fetch all workers
app.get("/admin/workers", (req, res) => {
  const query = "SELECT * FROM users WHERE role = 'worker'";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching workers:", err);
      res.status(500).json({ message: "Failed to fetch workers" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Add a new worker
// Add a new worker
app.post("/admin/workers", async (req, res) => {
  const { first_name, last_name, email, password, mobile_number, address } =
    req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (first_name, last_name, email, password, mobile_number, address, role) 
    VALUES (?, ?, ?, ?, ?, ?, 'worker')
  `;
  db.query(
    query,
    [first_name, last_name, email, hashedPassword, mobile_number, address],
    (err, result) => {
      if (err) {
        console.error("Error adding worker:", err);
        res.status(500).json({ message: "Failed to add worker" });
      } else {
        res.status(200).json({ message: "Worker added successfully" });
      }
    }
  );
});

// Update a worker
// Update a worker
app.put("/admin/workers/:worker_id", (req, res) => {
  const { worker_id } = req.params;
  const { first_name, last_name, email, mobile_number, address } = req.body;

  const query = `
    UPDATE users 
    SET first_name = ?, last_name = ?, email = ?, mobile_number = ?, address = ? 
    WHERE id = ? AND role = 'worker'
  `;
  db.query(
    query,
    [first_name, last_name, email, mobile_number, address, worker_id],
    (err, result) => {
      if (err) {
        console.error("Error updating worker:", err);
        res.status(500).json({ message: "Failed to update worker" });
      } else {
        res.status(200).json({ message: "Worker updated successfully" });
      }
    }
  );
});

// Delete a worker
app.delete("/admin/workers/:worker_id", (req, res) => {
  const { worker_id } = req.params;

  const query = "DELETE FROM users WHERE id = ? AND role = 'worker'";
  db.query(query, [worker_id], (err, result) => {
    if (err) {
      console.error("Error deleting worker:", err);
      res.status(500).json({ message: "Failed to delete worker" });
    } else {
      res.status(200).json({ message: "Worker deleted successfully" });
    }
  });
});

// Fetch all services
app.get("/admin/services", (req, res) => {
  const query = `
    SELECT services.*, workers.first_name AS worker_first_name, workers.last_name AS worker_last_name 
    FROM services 
    LEFT JOIN workers ON services.worker_id = workers.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching services:", err);
      res.status(500).json({ message: "Failed to fetch services" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Add a new service
app.post("/admin/services", (req, res) => {
  const { service_name, description, cost } = req.body;

  // Find a worker with < 5 active bookings
  const workerQuery = `
  SELECT id 
  FROM users 
  WHERE role = 'worker' AND approved = TRUE 
  AND (SELECT COUNT(*) FROM bookings WHERE bookings.worker_id = users.id AND bookings.status = 'active') < 5 
  LIMIT 1
`;
  db.query(workerQuery, (err, workers) => {
    if (err || workers.length === 0) {
      console.error("Error finding worker:", err);
      res.status(500).json({ message: "No available workers found" });
    } else {
      const worker_id = workers[0].id;

      const serviceQuery = `
        INSERT INTO services (service_name, description, cost, worker_id) 
        VALUES (?, ?, ?, ?)
      `;
      db.query(
        serviceQuery,
        [service_name, description, cost, worker_id],
        (err, result) => {
          if (err) {
            console.error("Error adding service:", err);
            res.status(500).json({ message: "Failed to add service" });
          } else {
            res.status(200).json({
              message: "Service added successfully and assigned to a worker",
            });
          }
        }
      );
    }
  });
});

// Update a service
app.put("/admin/services/:service_id", (req, res) => {
  const { service_id } = req.params;
  const { service_name, description, cost, worker_id } = req.body;

  const query = `
    UPDATE services 
    SET service_name = ?, description = ?, cost = ?, worker_id = ? 
    WHERE id = ?
  `;
  db.query(
    query,
    [service_name, description, cost, worker_id, service_id],
    (err, result) => {
      if (err) {
        console.error("Error updating service:", err);
        res.status(500).json({ message: "Failed to update service" });
      } else {
        res.status(200).json({ message: "Service updated successfully" });
      }
    }
  );
});

// Delete a service
app.delete("/admin/services/:service_id", (req, res) => {
  const { service_id } = req.params;

  const query = "DELETE FROM services WHERE id = ?";
  db.query(query, [service_id], (err, result) => {
    if (err) {
      console.error("Error deleting service:", err);
      res.status(500).json({ message: "Failed to delete service" });
    } else {
      res.status(200).json({ message: "Service deleted successfully" });
    }
  });
});
// Fetch all unapproved workers
// Fetch all unapproved workers
const workerQuery = `
  SELECT id 
  FROM users 
  WHERE role = 'worker' AND approved = TRUE 
  AND (SELECT COUNT(*) FROM bookings WHERE bookings.worker_id = users.id AND bookings.status = 'active') < 5 
  LIMIT 1
`;
app.get("/admin/workers/unapproved", (req, res) => {
  const query =
    "SELECT * FROM users WHERE role = 'worker' AND approved = FALSE";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching unapproved workers:", err);
      res.status(500).json({ message: "Failed to fetch unapproved workers" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Approve a worker
// Approve a worker
app.put("/admin/workers/:worker_id/approve", (req, res) => {
  const { worker_id } = req.params;

  const query =
    "UPDATE users SET approved = TRUE WHERE id = ? AND role = 'worker'";
  db.query(query, [worker_id], (err, result) => {
    if (err) {
      console.error("Error approving worker:", err);
      res.status(500).json({ message: "Failed to approve worker" });
    } else {
      res.status(200).json({ message: "Worker approved successfully" });
    }
  });
});

// Fetch approved workers with fewer than 5 active bookings

// Fetch all approved workers
// Fetch all approved workers
app.get("/admin/workers/approved", (req, res) => {
  const query = "SELECT * FROM users WHERE role = 'worker' AND approved = TRUE";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching approved workers:", err);
      res.status(500).json({ message: "Failed to fetch approved workers" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
