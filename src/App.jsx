import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Emendas from "./components/Emendas";
import Despesas from "./components/Despesas";
import Relatorios from "./components/Relatorios";
import Administracao from "./components/Administracao";
import Sobre from "./components/Sobre";
import { ToastProvider } from "./components/Toast";
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
    <ToastProvider>
      <Router>
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
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/emendas" element={<Emendas />} />
              <Route path="/despesas" element={<Despesas />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/administracao" element={<Administracao />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
      </Router>
    </ToastProvider>
  );
}

export default App;