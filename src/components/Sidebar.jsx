import React from "react";

const Sidebar = ({ setActiveSection }) => {
  const menuItems = [
    { name: "Users", section: "users" },
    { name: "Workers", section: "workers" },
    { name: "Services", section: "services" },
    { name: "Bookings", section: "bookings" },
    { name: "Approve Workers", section: "approve-workers" },
  ];

  return (
    <aside className="w-1/4 bg-gray-100 h-screen p-4">
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.section}
            className="cursor-pointer hover:bg-gray-200 p-2"
            onClick={() => setActiveSection(item.section)}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
