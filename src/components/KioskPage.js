import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import KioskMap from "./KioskMap";
import colors from "../theme/colors";

function KioskPage({ setPage }) {
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKiosks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "kiosks"));

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setKiosks(data);
      } catch (error) {
        console.error("Error fetching kiosks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKiosks();
  }, []);

  return (
    <div style={{ padding: "20px", paddingBottom: "90px" }}>
      
      {/* 🔙 Back */}
      <button
        onClick={() => setPage("home")}
        style={{
          background: "none",
          border: "none",
          color: colors.primary,
          cursor: "pointer",
          fontWeight: "500",
          marginBottom: "10px",
        }}
      >
        ⬅ Back
      </button>

      {/* HEADER */}
      <h2 style={{ color: colors.dark }}>📍 Nearby Kiosks</h2>
      <p style={{ color: colors.gray, fontSize: "14px" }}>
        Select a kiosk to continue printing
      </p>

      {/* 🗺️ MAP */}
      <KioskMap kiosks={kiosks} />

      {/* ⏳ Loading */}
      {loading ? (
        <p style={{ marginTop: "20px", color: colors.gray }}>
          Loading kiosks...
        </p>
      ) : kiosks.length === 0 ? (
        <p style={{ marginTop: "20px", color: colors.gray }}>
          No kiosks found
        </p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {kiosks.map((kiosk) => (
            <div
              key={kiosk.id}
              style={{
                padding: "16px",
                marginBottom: "12px",
                borderRadius: "14px",
                background: colors.white,
                border: "1px solid #EAF2FF",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginBottom: "5px" }}>{kiosk.name}</h3>

              <p style={{ fontSize: "14px", color: colors.gray }}>
                {kiosk.address}
              </p>

              <p style={{ fontSize: "13px", color: colors.gray }}>
                Status: {kiosk.status}
              </p>

              {/* 🔘 ACTIONS */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                {/* SELECT */}
                <button
                  onClick={() => {
                    localStorage.setItem(
                      "selectedKiosk",
                      JSON.stringify(kiosk)
                    );
                    setPage("print");
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: colors.primary,
                    color: colors.white,
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Select
                </button>

                {/* MAP */}
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${kiosk.lat},${kiosk.lng}`,
                      "_blank"
                    )
                  }
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: colors.light,
                    color: colors.primary,
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Open Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KioskPage;