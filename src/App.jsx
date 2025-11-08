import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import PageNotFound from "./pages/PageNotFound";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const appStyle = {
    display: "flex",
    minHeight: "100vh",
  };

  const contentStyle = {
    flex: 1,
    marginLeft: 220,
    transition: "margin-left 0.2s ease",
    minHeight: "100vh",
  };

  return (
    <Router>
      <ToastContainer />
      <div style={appStyle}>
        <aside
          id="sidebar"
          style={{ width: sidebarOpen ? 220 : 0, transition: "width 0.2s ease" }}
        >
          <div className="sidebar-title">
            <div className="sidebar-brand">
              <i className="bx bxs-school"></i> ADMIN
            </div>
            <span className="icon close_icon" onClick={closeSidebar}>
              X
            </span>
          </div>

          <ul className="sidebar-list">
            <li className="sidebar-list-item">
              <a href="/dashboard">
                <i className="bx bxs-dashboard"></i> Dashboard
              </a>
            </li>
            <li className="sidebar-list-item">
              <a href="/settings">
                <i className="bx bx-cog"></i> Settings
              </a>
            </li>
            <li className="sidebar-list-item">
              <a href="/profile">
                <i className="bx bxs-user"></i> Profile
              </a>
            </li>
          </ul>
        </aside>

        <main className="content" style={contentStyle}>
          <div className="header">
            <div className="menu-icon" onClick={openSidebar}>
              <i className="bx bx-menu"></i>
            </div>
            <div className="header-left">
              <i className="bx bx-search"></i>
            </div>
            <div className="header-right">
              <i className="bx bx-user-circle"></i>
            </div>
          </div>

          <div className="main-container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;