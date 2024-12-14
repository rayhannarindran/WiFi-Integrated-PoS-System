import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MainPage from "./components/MainPage"
import CustomerSelector from "./components/CustomerSelector";
import TransactionLogs from "./components/TransactionLogs";

const App = () => {
  return (
    <Router>
      <div className="App">
        {/* Define routes to different components */}
        <Routes>
          <Route path="/" element={<MainPage />} />  {/* Main Page */}
          <Route path="/customer" element={<CustomerSelector />} />  {/* Customer Selector */}
          <Route path="/transaction" element={<TransactionLogs />} />  {/* Settings Page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
