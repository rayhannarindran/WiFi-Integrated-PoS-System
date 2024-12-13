import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CustomerSelector from "./components/CustomerSelector";
import ReprintStruck from "./components/ReprintStruck";
import TransactionLogs from "./components/TransactionLogs"; // Halaman baru
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="container">
        <h1>Frontend Operator</h1>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="card">
                  <CustomerSelector />
                </div>
                <div className="card">
                  <ReprintStruck />
                  <Link to="/transactions" className="primary-button">
                    Lihat Log Transaksi
                  </Link>
                </div>
              </>
            }
          />
          <Route path="/transactions" element={<TransactionLogs />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
