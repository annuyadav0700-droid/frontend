import React, { useState } from "react";
import jsPDF from "jspdf";

function History({ orders, setPage }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const downloadReceipt = (order) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("A4Station Receipt", 20, 20);

  doc.setFontSize(12);
  doc.text(`Order Code: ${order.code}`, 20, 40);
  doc.text(`Amount: ₹${order.amount}`, 20, 50);
  doc.text(`Pages: ${order.pages}`, 20, 60);
  doc.text(`Copies: ${order.copies}`, 20, 70);
  doc.text(`Print Type: ${order.printType}`, 20, 80);
  doc.text(`Print Side: ${order.printSide}`, 20, 90);
  doc.text(`Date: ${order.date}`, 20, 100);

  doc.text("Thank you for using A4Station 🚀", 20, 120);

  doc.save(`receipt_${order.code}.pdf`);
};
  return (
    <div className="history-page">
      {/* 🔙 Back */}
      <button onClick={() => setPage("dashboard")}>⬅ Back</button>

      <h2>My Orders</h2>

      {/* ❌ No orders */}
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="order-list">
          {orders.map((order, index) => (
            <div key={index} className="order-card">
              <h3>🧾 Order #{order.code}</h3>
              <p>₹ {order.amount}</p>
              <p>{order.date}</p>

              {/* ✅ YAHI ANDAR hona chahiye */}
              <button onClick={() => setSelectedOrder(order)}>
                View Receipt
              </button>
              <button onClick={() => downloadReceipt(order)}>
              📄 Download Receipt
               </button>
              
            </div>
          ))}
        </div>
      )}

      {/* 📄 RECEIPT POPUP */}
      {selectedOrder && (
        <div className="receipt-popup">
          <div className="receipt-card">
            <h2>🧾 Receipt</h2>

            <p><strong>Order Code:</strong> {selectedOrder.code}</p>
            <p><strong>Amount:</strong> ₹{selectedOrder.amount}</p>
            <p><strong>Pages:</strong> {selectedOrder.pages}</p>
            <p><strong>Copies:</strong> {selectedOrder.copies}</p>
            <p><strong>Type:</strong> {selectedOrder.printType}</p>
            <p><strong>Side:</strong> {selectedOrder.printSide}</p>
            <p><strong>Date:</strong> {selectedOrder.date}</p>

            <button onClick={() => setSelectedOrder(null)}>
              Close
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default History;