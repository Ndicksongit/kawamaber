import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("kawa_token"));

  if (!token) {
    return <Login onLogin={(t) => setToken(t)} />;
  }

  return <Dashboard />;
}
