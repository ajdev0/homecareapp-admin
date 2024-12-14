import React from "react";

const DashboardCard = ({ title, value, description }) => {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default DashboardCard;
