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
        <h2>Hi, {userName} 👋</h2>
        <p style={{ color: "#666" }}>
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
        }}
      >
        <h3>⚡ Upload & Print Instantly</h3>
        <p style={{ fontSize: "14px", opacity: 0.8 }}>
          Select kiosk → Upload → Pay → Print
        </p>

        <button
          onClick={() => setPage("upload")}
          style={{
            marginTop: "15px",
            padding: "10px 15px",
            borderRadius: "8px",
            border: "none",
            background: colors.white,
            color: colors.primary,
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Start Printing 🚀
        </button>
      </div>

      {/* 📄 RECENT ORDERS */}
      <div style={{ marginTop: "30px" }}>
        <h3>Recent Orders</h3>

        <div
          style={{
            marginTop: "10px",
            padding: "15px",
            borderRadius: "12px",
            background: colors.white,
            fontSize: "14px",
            color: "#555",
          }}
        >
          You can view all your orders in the Orders tab 📄
        </div>
      </div>

      {/* 📍 QUICK ACTIONS */}
      <div style={{ marginTop: "30px" }}>
        <h3>Quick Actions</h3>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <div
            onClick={() => setPage("upload")}
            style={{
              flex: 1,
              padding: "15px",
              background: colors.white,
              borderRadius: "12px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            🖨️ Print
          </div>

          <div
            onClick={() => setPage("orders")}
            style={{
              flex: 1,
              padding: "15px",
              background: colors.white,
              borderRadius: "12px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            📄 Orders
          </div>
        </div>
      </div>

      {/* 💬 HELP / SUPPORT */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <p style={{ color: "#888", fontSize: "14px" }}>
          Need help?
        </p>

        <button
          onClick={() =>
            window.open("https://wa.me/917206726848", "_blank") // 👉 अपना नंबर डालना
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