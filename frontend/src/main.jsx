import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AboutNPS from './pages/AboutNPS' // New Import
import Guidelines from './pages/Guidelines' // New Import
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Onboarding Journey / Home Page */}
        <Route path="/" element={<App />} />
        
        {/* Administrator Monitoring Hub */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Informational Static Pages */}
        <Route path="/about" element={<AboutNPS />} />
        <Route path="/guidelines" element={<Guidelines />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)