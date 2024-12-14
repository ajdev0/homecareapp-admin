import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AdminLogin from "./components/AdminLogin";
import ManageUsers from "./components/ManageUsers";
import ManageWorkers from "./components/ManageWorkers";
import ManageServices from "./components/ManageServices";
import ManageBookings from "./components/ManageBookings";
import ApproveWorkers from "./components/ApproveWorkers";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("users");

  if (!loggedIn) return <AdminLogin setLoggedIn={setLoggedIn} />;

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return <ManageUsers />;
      case "workers":
        return <ManageWorkers />;
      case "services":
        return <ManageServices />;
      case "bookings":
        return <ManageBookings />;
      case "approve-workers":
        return <ApproveWorkers />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar setActiveSection={setActiveSection} />
      <div className="w-3/4">
        <Navbar />
        <div className="p-4">{renderSection()}</div>
      </div>
    </div>
  );
};

export default App;
