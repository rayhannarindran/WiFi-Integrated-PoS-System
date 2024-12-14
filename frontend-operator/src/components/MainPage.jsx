import React from "react";
import { Link } from "react-router-dom";
import './MainPage.css';
import operatorLogo from '../assets/operator.png'; // Import gambar dari folder assets

const MainPage = () => (
  <div className="main-page">
    {/* Gambar di atas teks */}
    <img 
      src={operatorLogo} 
      alt="WiFi PoS Logo" 
      className="main-page-logo" 
    />
    <h1>Welcome to the Operator System</h1>
    <div className="links">
      <Link to="/transaction" className="link-button">
        View Transaction Logs
      </Link>
    </div>
  </div>
);

export default MainPage;
