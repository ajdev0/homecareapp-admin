import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    service_name: "",
    description: "",
    cost: "",
  });

  const fetchServices = async () => {
    const response = await axios.get("http://localhost:3000/admin/services");
    setServices(response.data);
  };

  const handleFormChange = (e) => {
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });
  };

  const addService = async () => {
    await axios.post("http://localhost:3000/admin/services", serviceForm);
    fetchServices();
    alert("Service added successfully");
  };

  const deleteService = async (id) => {
    await axios.delete(`http://localhost:3000/admin/services/${id}`);
    fetchServices();
    alert("Service deleted successfully");
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Services</h2>
      <div className="mb-4">
        <h3 className="font-bold">Add New Service</h3>
        <input
          type="text"
          name="service_name"
          placeholder="Service Name"
          className="border p-2 m-2"
          onChange={handleFormChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          className="border p-2 m-2"
          onChange={handleFormChange}
        />
        <input
          type="number"
          name="cost"
          placeholder="Cost"
          className="border p-2 m-2"
          onChange={handleFormChange}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={addService}
        >
          Add Service
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Cost</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td className="border px-4 py-2">{service.id}</td>
              <td className="border px-4 py-2">{service.service_name}</td>
              <td className="border px-4 py-2">${service.cost}</td>
              <td className="border px-4 py-2">
                <button
                  className="text-red-600"
                  onClick={() => deleteService(service.id)}
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

export default ManageServices;
