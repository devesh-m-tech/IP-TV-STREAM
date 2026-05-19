// admin-ui/src/App.js
import React, { useState, useEffect } from "react";
import AdminLogin from "./components/auth/AdminLogin";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import "./index.css";

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("adminToken"));

  useEffect(() => {
    setAuthed(!!localStorage.getItem("adminToken"));
  }, []);

  if (!authed) {
    return <AdminLogin onAuth={() => setAuthed(true)} />;
  }

  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}
// import React, { useState, useEffect } from "react";
// import AdminLogin from "./components/auth/AdminLogin";
// import UserDashboard from "./components/dashboard/UserDashboard"; // ✅ CORRECT
// import "./index.css";

// export default function App() {
//   const [authed, setAuthed] = useState(!!localStorage.getItem("token"));

//   useEffect(() => {
//     setAuthed(!!localStorage.getItem("token"));
//   }, []);

//   if (!authed) {
//     return <AdminLogin onAuth={() => setAuthed(true)} />;
//   }

//   return <UserDashboard onLogout={() => setAuthed(false)} />;
// }
