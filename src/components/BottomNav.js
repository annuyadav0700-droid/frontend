import React from "react";
import colors from "../theme/colors";

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
        background: colors.white,
        borderTop: "1px solid #EAF2FF",
        padding: "10px 0",
        zIndex: 1000,
        boxShadow: "0 -5px 20px rgba(0,0,0,0.05)",
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
              color: isActive ? colors.primary : colors.gray,
              fontWeight: isActive ? "600" : "400",
              fontSize: "12px",
              transition: "0.2s",
            }}
          >
            {/* ICON */}
            <span
              style={{
                fontSize: "20px",
                marginBottom: "2px",
              }}
            >
              {tab.icon}
            </span>

            {/* LABEL */}
            {tab.label}
          </div>
        );
      })}
    </div>
  );
}

export default BottomNav;