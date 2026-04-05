import React from "react";
import colors from "../theme/colors";

function Dashboard({ user, setPage }) {
  const userName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    user?.phoneNumber ||
    "User";

  return (
    <div style={{ padding: "20px", paddingBottom: "90px" }}>
      
      {/* 👋 HEADER */}
      <div>
        <h2 style={{ color: colors.dark }}>Hi, {userName} 👋</h2>
        <p style={{ color: colors.gray }}>
          Print your documents in seconds
        </p>
      </div>

      {/* 🔥 HERO CARD */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "16px",
          background: colors.primary,
          color: colors.white,
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h3>⚡ Upload & Print Instantly</h3>

        <p style={{ fontSize: "14px", opacity: 0.9 }}>
          1. Select kiosk → 2. Upload → 3. Pay → 4. Print
        </p>

        <button
          onClick={() => setPage("upload")}
          style={{
            marginTop: "15px",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            background: colors.white,
            color: colors.primary,
            cursor: "pointer",
            fontWeight: "600",
            transition: "0.2s",
          }}
        >
          Start Printing 🚀
        </button>
      </div>

      {/* 📄 RECENT ORDERS */}
      <div style={{ marginTop: "32px" }}>
        <h3 style={{ color: colors.dark }}>Recent Orders</h3>

        <div
          style={{
            marginTop: "12px",
            padding: "15px",
            borderRadius: "12px",
            background: colors.white,
            fontSize: "14px",
            color: colors.gray,
            border: "1px solid #EAF2FF",
          }}
        >
          You can view all your orders in the Orders tab 📄
        </div>
      </div>

      {/* 📍 QUICK ACTIONS */}
      <div style={{ marginTop: "32px" }}>
        <h3 style={{ color: colors.dark }}>Quick Actions</h3>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          {/* PRINT */}
          <div
            onClick={() => setPage("upload")}
            style={{
              flex: 1,
              padding: "16px",
              background: colors.white,
              borderRadius: "12px",
              textAlign: "center",
              cursor: "pointer",
              border: "1px solid #EAF2FF",
              fontWeight: "500",
            }}
          >
            🖨️ Print
          </div>

          {/* ORDERS */}
          <div
            onClick={() => setPage("orders")}
            style={{
              flex: 1,
              padding: "16px",
              background: colors.white,
              borderRadius: "12px",
              textAlign: "center",
              cursor: "pointer",
              border: "1px solid #EAF2FF",
              fontWeight: "500",
            }}
          >
            📄 Orders
          </div>
        </div>
      </div>

      {/* 💬 HELP / SUPPORT */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <p style={{ color: colors.gray, fontSize: "14px" }}>
          Need help?
        </p>

        <button
          onClick={() =>
            window.open("https://wa.me/917206726848", "_blank")
          }
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            background: "#25D366",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          💬 Chat on WhatsApp
        </button>
      </div>
    </div>
  );
}

export default Dashboard;