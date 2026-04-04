import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import KioskMap from "./KioskMap";
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

        console.log("Kiosks:", data);
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
    <div style={{ padding: "20px" }}>
      {/* 🔙 Back */}
      <button onClick={() => setPage("dashboard")}>⬅ Back</button>

      <h2>📍 Nearby Kiosks</h2>

      {/* 🗺️ MAP YAHAN ADD KARNA HAI */}
    <KioskMap kiosks={kiosks} />


      {/* ⏳ Loading */}
      {loading ? (
        <p>Loading kiosks...</p>
      ) : kiosks.length === 0 ? (
        <p>No kiosks found</p>
      ) : (
        <div className="card-container">
          {kiosks.map((kiosk) => (
            <div key={kiosk.id} className="card">
              <h3>{kiosk.name}</h3>
              <p>{kiosk.address}</p>
              <p>Status: {kiosk.status}</p>
              <button
  onClick={() => {
    localStorage.setItem("selectedKiosk", JSON.stringify(kiosk));
    alert("Kiosk selected ✅");
    setPage("print"); // 👉 direct print page pe le jao
  }}
>
  Select this Kiosk
</button>

              {/* 📍 Open in Google Maps */}
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${kiosk.lat},${kiosk.lng}`,
                    "_blank"
                  )
                }
              >
                Open in Map
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KioskPage;