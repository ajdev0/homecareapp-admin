import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const response = await axios.get("http://localhost:3000/bookings");
    setBookings(response.data);
  };

  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:3000/bookings/${id}/status`, { status });
    fetchBookings();
    alert("Status updated successfully");
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Bookings</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Service</th>
            <th className="border px-4 py-2">Cost</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
            <th className="border px-4 py-2">Worker Name</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="border px-4 py-2">{booking.id}</td>
              <td className="border px-4 py-2">{`${booking.user_first_name} ${booking.user_last_name}`}</td>
              <td className="border px-4 py-2">{booking.service_name}</td>
              <td className="border px-4 py-2">${booking.total_cost}</td>
              <td className="border px-4 py-2">{booking.status}</td>
              <td className="border px-4 py-2">
                <select
                  value={booking.status}
                  onChange={(e) => updateStatus(booking.id, e.target.value)}
                  className="border px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td className="border px-4 py-2">{`${booking.worker_first_name} ${booking.worker_last_name}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageBookings;
