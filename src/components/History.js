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
    doc.text(`Kiosk: ${order.kioskName}`, 20, 110);

    doc.text("Thank you for using A4Station 🚀", 20, 130);

    doc.save(`receipt_${order.code}.pdf`);
  };

  return (
    <div style={{ padding: "20px", paddingBottom: "80px" }}>
      {/* 🔙 Back */}
      <button
        onClick={() => setPage("home")}
        style={{
          background: "none",
          border: "none",
          color: "#2563EB",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      >
        ⬅ Back
      </button>

      <h2>My Orders</h2>

      {/* ❌ No orders */}
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div>
          {orders.map((order, index) => (
            <div
              key={index}
              style={{
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "16px",
                background: "#FFFFFF",
                border: "1px solid #EAF2FF",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
              }}
            >
              <h3>🧾 Order #{order.code}</h3>
              <p>₹ {order.amount}</p>
              <p>{order.date}</p>
              <p>Kiosk: {order.kioskName || "Not selected"}</p>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  className="pay-btn"
                  style={{ padding: "10px", flex: 1, fontSize: "14px", background: "#EAF2FF", color: "#2563EB", boxShadow: "none" }}
                  onClick={() => setSelectedOrder(order)}
                >
                  View Receipt
                </button>

                <button
                  className="pay-btn"
                  style={{ padding: "10px", flex: 1, fontSize: "14px", boxShadow: "none" }}
                  onClick={() => downloadReceipt(order)}
                >
                  📄 Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 POPUP */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          {/* 🧾 RECEIPT CARD */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h2>🧾 Receipt</h2>

            <p><strong>Order Code:</strong> {selectedOrder.code}</p>
            <p><strong>Amount:</strong> ₹{selectedOrder.amount}</p>
            <p><strong>Pages:</strong> {selectedOrder.pages}</p>
            <p><strong>Copies:</strong> {selectedOrder.copies}</p>
            <p><strong>Type:</strong> {selectedOrder.printType}</p>
            <p><strong>Side:</strong> {selectedOrder.printSide}</p>
            <p><strong>Date:</strong> {selectedOrder.date}</p>
            <p><strong>Kiosk:</strong> {selectedOrder.kioskName}</p>

            <button
              onClick={() => setSelectedOrder(null)}
              className="pay-btn"
              style={{ marginTop: "20px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;