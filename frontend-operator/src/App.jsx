import React, { useState } from "react";
import CustomerSelector from "./components/customerselector";
import ReprintStruck from "./components/reprintstruck";
import "./App.css";

const App = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleCustomerSelection = (type) => {
    setSelectedCustomer(type);
  };

  return (
    <div className="container">
      <h1>Frontend Operator</h1>
      <div className="card">
        <CustomerSelector onSelection={handleCustomerSelection} />
        {selectedCustomer && <p>Jenis Customer: {selectedCustomer}</p>}
      </div>
      <div className="card">
        <ReprintStruck />
      </div>
    </div>
  );
};

export default App;
