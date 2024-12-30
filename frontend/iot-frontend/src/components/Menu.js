// src/Menu.js
import './styles/Menu.css';

import React from 'react';
import { Link } from 'react-router-dom';

const Menu = () => {
    return (
        <nav>
            <ul>
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/sensor-history">Sensor History</Link></li>
                <li><Link to="/led-history">LED History</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/outdoor">Dashboard 2</Link></li>
            </ul>
        </nav>
    );
};

export default Menu;
