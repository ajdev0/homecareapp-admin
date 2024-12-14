import React, { useState, useEffect } from "react";
import axios from "axios";

const ApproveWorkers = () => {
  const [unapprovedWorkers, setUnapprovedWorkers] = useState([]);

  const fetchUnapprovedWorkers = async () => {
    const response = await axios.get(
      "http://localhost:3000/admin/workers/unapproved"
    );
    setUnapprovedWorkers(response.data);
  };

  const approveWorker = async (id) => {
    await axios.put(`http://localhost:3000/admin/workers/${id}/approve`);
    fetchUnapprovedWorkers();
    alert("Worker approved successfully");
  };

  useEffect(() => {
    fetchUnapprovedWorkers();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Approve Workers</h2>
      <ul>
        {unapprovedWorkers.map((worker) => (
          <li key={worker.id} className="mb-2">
            {`${worker.first_name} ${worker.last_name}`} ({worker.email})
            <button
              className="bg-green-600 text-white px-4 py-2 ml-4 rounded"
              onClick={() => approveWorker(worker.id)}
            >
              Approve
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApproveWorkers;
