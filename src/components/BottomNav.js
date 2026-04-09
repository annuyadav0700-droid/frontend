import React from "react";
import colors from "../theme/colors";
import { Home, CloudUpload, FileText, User } from "lucide-react";

function BottomNav({ page, setPage }) {
  const tabs = [
    { id: "home", label: "Home", Icon: Home },
    { id: "upload", label: "Upload", Icon: CloudUpload },
    { id: "orders", label: "Orders", Icon: FileText },
    { id: "profile", label: "Profile", Icon: User },
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
            <div
              style={{
                marginBottom: "4px",
                padding: "8px",
                borderRadius: "12px",
                background: isActive ? colors.light : "transparent",
                color: isActive ? colors.primary : colors.gray,
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <tab.Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>

            {/* LABEL */}
            {tab.label}
          </div>
        );
      })}
    </div>
  );
}

export default BottomNav;