import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Emendas from './components/Emendas';
import Despesas from './components/Despesas';
import Relatorios from './components/Relatorios';
import Administracao from './components/Administracao';
import Sobre from './components/Sobre';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/emendas" element={<PrivateRoute><Emendas /></PrivateRoute>} />
                <Route path="/despesas" element={<PrivateRoute><Despesas /></PrivateRoute>} />
                <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
                <Route path="/administracao" element={<PrivateRoute><Administracao /></PrivateRoute>} />
                <Route path="/sobre" element={<PrivateRoute><Sobre /></PrivateRoute>} />
              </Routes>
            </div>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
