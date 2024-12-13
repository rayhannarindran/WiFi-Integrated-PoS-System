import React, { useState } from "react";

const ReprintStruck = () => {
  const [status, setStatus] = useState("");

  const handleReprint = () => {
    setStatus("Memproses ulang struk...");
    setTimeout(() => {
      setStatus("Struk berhasil dicetak ulang!");
    }, 2000);
  };

  return (
    <div>
      <h2>Reprint Struk</h2>
      <button className="primary" onClick={handleReprint}>
        Cetak Ulang Struk
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default ReprintStruck;
