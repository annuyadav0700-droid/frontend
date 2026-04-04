import React from "react";

function Dashboard({ user, setPage }) {
  return (
    <div className="dashboard">

      {/* 🔝 TOP BAR */}
      <div className="topbar">
        <h2 className="logo">A4Station</h2>

        <button className="profile-btn" onClick={() => setPage("profile")}>
          👤
        </button>
      </div>

      {/* 👋 WELCOME */}
      <div className="welcome">
        <h1>Welcome 🚀</h1>
        <p>{user.email || user.phoneNumber}</p>
      </div>

      {/* 📦 CARDS */}
      <div className="card-container">

        {/* 🖨️ PRINT */}
        <div className="card" onClick={() => setPage("print")}>
          <h3>🖨️ Print Document</h3>
          <p>Upload & print instantly</p>
        </div>

        {/* 📄 HISTORY */}
        <div className="card" onClick={() => setPage("history")}>
          <h3>📄 My Orders</h3>
          <p>View receipts & history</p>
        </div>

        {/* 💰 FUTURE (optional) */}
        <div className="card disabled">
          <h3>💰 Wallet</h3>
          <p>Coming soon</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;