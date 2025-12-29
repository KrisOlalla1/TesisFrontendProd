import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Auth/Login';
// import Register from './pages/Auth/Register'; // Registro deshabilitado
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorLogin from './pages/DoctorLogin';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        {/* Ruta de registro removida - Solo admin puede crear doctores */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
