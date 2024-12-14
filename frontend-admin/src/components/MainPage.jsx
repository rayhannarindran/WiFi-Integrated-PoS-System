// src/components/MainPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';
import AdminImage from '../assets/admin.png'; // Import the image

const MainPage = () => {
  return (
    <div className='main-page'>
      <img src={AdminImage} alt="Admin Panel" className="admin-image" />
      <h1>WiFi PoS Integration Manager</h1>
      <div className="button-container">
        <div className="section">
            <Link to="/placeholder1">
            <button  className='main-page-button'>NETWORK MONITORING</button>
            </Link>
        </div>

        <div className="section">
            <Link to="/device-manager">
            <button className='main-page-button'>DEVICE MANAGEMENT</button>
            </Link>
        </div>

        <div className="section">
            <Link to="/settings">
            <button className='main-page-button'>ADMIN SETTINGS</button>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
