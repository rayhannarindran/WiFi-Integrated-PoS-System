import React, { useEffect, useState } from "react";
import "./TransactionLogs.css";

const TransactionLogs = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_TRANSACTIONS_API_URL = `http://localhost:3001/api/transaction/get-all-transactions`;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(BACKEND_TRANSACTIONS_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTransactions(data.data.transactions || []); // Pastikan hanya mengambil array transactions
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handlePrint = async (id) => {
    try {
      const transaction = transactions.find((t) => t.order.id === id);
      const data_to_print = { "order": transaction.order, "qrUrl": transaction.qrUrl }
      const response = await fetch(`http://localhost:3001/api/transaction/print-transaction`, data_to_print, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ envName: "PRINTER_USB_VENDOR_ID" }),
      });
      if (!response.ok) {
        throw new Error(`Failed to print receipt: ${response.statusText}`);
      }
      const data = await response.json();
      alert(data.message || "Struk berhasil dicetak!");
    } catch (err) {
      console.error("Error printing receipt:", err);
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
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tanggal Dibuat</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Data QR</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.order.id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {transaction.order.id}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {new Date(transaction.created_at).toLocaleString()}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {transaction.qrUrl}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  className="primary-button"
                  onClick={() => handlePrint(transaction.order.id)}
                >
                  Print Struk
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
