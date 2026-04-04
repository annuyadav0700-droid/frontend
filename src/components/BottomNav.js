import React from "react";

function BottomNav({ page, setPage }) {
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "upload", label: "Upload", icon: "📤" },
    { id: "orders", label: "Orders", icon: "📄" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        background: "#ffffff",
        borderTop: "1px solid #ddd",
        padding: "8px 0",
        zIndex: 1000,
      }}
    >
      {tabs.map((tab) => {
        const isActive = page === tab.id;

        return (
          <div
            key={tab.id}
            onClick={() => setPage(tab.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              color: isActive ? "#000" : "#888",
              fontWeight: isActive ? "600" : "400",
              fontSize: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>{tab.icon}</span>
            {tab.label}
          </div>
        );
      })}
    </div>
  );
}

export default BottomNav;