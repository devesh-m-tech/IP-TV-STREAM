// src/App.js
import React, { useState, useEffect } from "react";
import Login from "./components/auth/Login";
import UserDashboard from "./components/dashboard/UserDashboard";
import "./index.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if token exists on app load
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsLoggedIn(true);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className="app">
      {isLoggedIn ? (
        <UserDashboard onLogout={handleLogout} />
      ) : (
        <Login setLoggedIn={setIsLoggedIn} />
      )}
    </div>
  );
}

export default App;
