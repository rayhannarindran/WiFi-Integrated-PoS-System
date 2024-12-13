import React, { useState } from "react";

const CustomerSelector = ({ onSelection }) => {
  const [customerType, setCustomerType] = useState("");

  const handleSelect = (type) => {
    setCustomerType(type);
    onSelection(type);
  };

  return (
    <div>
      <h2>Pilih Jenis Customer</h2>
      <button
        className="primary"
        onClick={() => handleSelect("VIP")}
      >
        VIP
      </button>
      <button
        className="secondary"
        onClick={() => handleSelect("Non-VIP")}
      >
        Non-VIP
      </button>
      {customerType && <p>Customer yang dipilih: {customerType}</p>}
    </div>
  );
};

export default CustomerSelector;
