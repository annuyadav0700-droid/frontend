import React, { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

function KioskScreen({ setPage }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 यह हर मशीन के लिए अलग होगा
  const KIOSK_ID = "kiosk_1"; // 🔥 change per kiosk

  const handleVerify = async () => {
    if (!code) {
      alert("Enter code");
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "orders"),
        where("code", "==", code),
        where("kioskId", "==", KIOSK_ID),
        where("status", "==", "pending")
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Invalid or already used code ❌");
        setLoading(false);
        return;
      }

      const orderDoc = snapshot.docs[0];
      const order = orderDoc.data();

      console.log("Order found:", order);

      // ✅ status update (verified)
      await updateDoc(doc(db, "orders", orderDoc.id), {
        status: "verified",
      });

      alert("Code verified ✅ Printing...");

      // 👉 अभी सिर्फ log करेंगे
      console.log("PRINT TRIGGER:", order.fileUrl);

      // बाद में यहाँ actual printer trigger आएगा

    } catch (error) {
      console.error(error);
      alert("Error verifying code");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>🖨️ Kiosk Screen</h2>

      <input
        type="text"
        placeholder="Enter Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ padding: "10px", fontSize: "18px" }}
      />

      <br /><br />

      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Checking..." : "Print"}
      </button>

      <br /><br />

      <button onClick={() => setPage("dashboard")}>Back</button>
    </div>
  );
}

export default KioskScreen;