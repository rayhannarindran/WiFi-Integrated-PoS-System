import React, { useEffect, useState } from "react";

const TransactionLogs = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_TRANSACTIONS_API_URL = `http://127.0.0.1:${import.meta.env.VITE_BACKEND_SERVER_PORT}/api/transactions`;

  useEffect(() => {
    // Fetch data transaksi dari backend
    const fetchTransactions = async () => {
      try {
        const response = await fetch(BACKEND_TRANSACTIONS_API_URL);
        const data = await response.json();
        setTransactions(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleReprint = async (id) => {
    try {
      const response = await fetch(`${BACKEND_TRANSACTIONS_API_URL}/${id}/reprint`, {
        method: "POST",
      });
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      console.error("Error reprinting receipt:", err);
    }
  };
  

  if (loading) {
    return <p>Memuat data transaksi...</p>;
  }

  return (
    <div className="card">
      <h2>Log Transaksi</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID Transaksi</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>QR URL</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tanggal</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {transaction._id}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <a href={transaction.qrUrl} target="_blank" rel="noopener noreferrer">
                  Lihat QR
                </a>
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {new Date(transaction.created_at).toLocaleString()}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  className="primary-button"
                  onClick={() => handleReprint(transaction._id)}
                >
                  Cetak Ulang
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionLogs;
