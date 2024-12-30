import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard'; // default import
import SensorHistory from './components/SensorHistory'; // default import
import LedHistory from './components/LedHistory'; // default import
import Profile from './components/Profile'; // default import
import Menu from './components/Menu'; // default import
import '@fortawesome/fontawesome-free/css/all.min.css';
import DashboardOutdoor from './components/DashboardOutdoor'; // default import

function App() {
    return (
        <Router>
            <Menu />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sensor-history" element={<SensorHistory />} />
                <Route path="/led-history" element={<LedHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/outdoor" element={<DashboardOutdoor />} /> {/* Đảm bảo là default component */}
            </Routes>
        </Router>
    );
}

export default App;
