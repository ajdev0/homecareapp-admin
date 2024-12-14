import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageWorkers = () => {
  const [approvedWorkers, setApprovedWorkers] = useState([]);
  const [unapprovedWorkers, setUnapprovedWorkers] = useState([]);
  const [workerForm, setWorkerForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    mobile_number: "",
    address: "",
  });
  const [editingWorker, setEditingWorker] = useState(null); // Worker being edited

  // Fetch workers (approved and unapproved)
  const fetchWorkers = async () => {
    try {
      const approvedResponse = await axios.get(
        "http://localhost:3000/admin/workers/approved"
      );
      const unapprovedResponse = await axios.get(
        "http://localhost:3000/admin/workers/unapproved"
      );

      setApprovedWorkers(approvedResponse.data);
      setUnapprovedWorkers(unapprovedResponse.data);
    } catch (err) {
      console.error("Error fetching workers:", err);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Handle form changes
  const handleFormChange = (e) => {
    setWorkerForm({ ...workerForm, [e.target.name]: e.target.value });
  };

  // Add or Update Worker
  const saveWorker = async () => {
    try {
      if (editingWorker) {
        await axios.put(
          `http://localhost:3000/admin/workers/${editingWorker.id}`,
          workerForm
        );
        alert("Worker updated successfully");
      } else {
        await axios.post("http://localhost:3000/admin/workers", workerForm);
        alert("Worker added successfully");
      }

      setWorkerForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        mobile_number: "",
        address: "",
      });
      setEditingWorker(null);
      fetchWorkers();
    } catch (err) {
      console.error(err);
      alert("Failed to save worker");
    }
  };

  // Delete Worker
  const deleteWorker = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/admin/workers/${id}`);
      alert("Worker deleted successfully");
      fetchWorkers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete worker");
    }
  };

  // Approve Worker
  const approveWorker = async (id) => {
    try {
      await axios.put(`http://localhost:3000/admin/workers/${id}/approve`);
      alert("Worker approved successfully");
      fetchWorkers();
    } catch (err) {
      console.error(err);
      alert("Failed to approve worker");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Workers</h2>

      {/* Add or Edit Worker Form */}
      <div className="mb-4">
        <h3 className="font-bold">
          {editingWorker ? "Edit Worker" : "Add New Worker"}
        </h3>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={workerForm.first_name}
          onChange={handleFormChange}
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={workerForm.last_name}
          onChange={handleFormChange}
          className="border p-2 m-2"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={workerForm.email}
          onChange={handleFormChange}
          className="border p-2 m-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={workerForm.password}
          onChange={handleFormChange}
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="mobile_number"
          placeholder="Mobile Number"
          value={workerForm.mobile_number}
          onChange={handleFormChange}
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={workerForm.address}
          onChange={handleFormChange}
          className="border p-2 m-2"
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={saveWorker}
        >
          {editingWorker ? "Update Worker" : "Add Worker"}
        </button>
      </div>

      {/* Unapproved Workers */}
      <h3 className="font-bold mb-2">Unapproved Workers</h3>
      <table className="w-full border mb-4">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {unapprovedWorkers.map((worker) => (
            <tr key={worker.id}>
              <td className="border px-4 py-2">{worker.id}</td>
              <td className="border px-4 py-2">
                {`${worker.first_name} ${worker.last_name}`}
              </td>
              <td className="border px-4 py-2">{worker.email}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={() => approveWorker(worker.id)}
                >
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Approved Workers */}
      <h3 className="font-bold mb-2">Approved Workers</h3>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvedWorkers.map((worker) => (
            <tr key={worker.id}>
              <td className="border px-4 py-2">{worker.id}</td>
              <td className="border px-4 py-2">
                {`${worker.first_name} ${worker.last_name}`}
              </td>
              <td className="border px-4 py-2">{worker.email}</td>
              <td className="border px-4 py-2">
                <button
                  className="text-blue-600"
                  onClick={() => {
                    setEditingWorker(worker);
                    setWorkerForm(worker);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 ml-2"
                  onClick={() => deleteWorker(worker.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageWorkers;
