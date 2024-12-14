import React from "react";
import { Link } from "react-router-dom";
import './MainPage.css';

const MainPage = () => (
  <div className="main-page">
    <h1>Welcome to the WiFi Integrated PoS System</h1>
    <div className="links">
      <Link to="/customer-selector" className="link-button">
        Go to Customer Selector
      </Link>
      <Link to="/transaction" className="link-button">
        View Transaction Logs
      </Link>
    </div>
  </div>
);

export default MainPage;
