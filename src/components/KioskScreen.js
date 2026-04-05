import React, { useState } from "react";
import { db } from "../firebase";
import {collection,query,where,getDocs,updateDoc,doc,}from "firebase/firestore";
import colors from "../theme/colors";

function KioskScreen({ setPage }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const KIOSK_ID = "kiosk_1"; // 🔥 change per kiosk

  const handleVerify = async () => {
    if (!code.trim()) {
      setMessage("⚠️ Please enter code");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const q = query(
        collection(db, "orders"),
        where("code", "==", code),
        where("kioskId", "==", KIOSK_ID),
        where("status", "==", "pending")
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMessage("❌ Invalid or already used code");
        setLoading(false);
        return;
      }

      const orderDoc = snapshot.docs[0];
      const order = orderDoc.data();

      await updateDoc(doc(db, "orders", orderDoc.id), {
        status: "verified",
      });

      setMessage("✅ Printing started...");

      console.log("PRINT TRIGGER:", order.fileUrl);

    } catch (error) {
      console.error(error);
      setMessage("❌ Error verifying code");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: colors.white,
          borderRadius: "20px",
          padding: "25px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: colors.dark }}>🖨️ Print Station</h2>

        <p style={{ color: colors.gray, fontSize: "14px" }}>
          Enter your order code to print
        </p>

        {/* 🔢 INPUT */}
        <input
          type="text"
          placeholder="Enter Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "14px",
            fontSize: "18px",
            borderRadius: "12px",
            border: "1px solid #EAF2FF",
            outline: "none",
            textAlign: "center",
            letterSpacing: "2px",
          }}
        />

        {/* 🔘 BUTTON */}
        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: colors.primary,
            color: colors.white,
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {loading ? "Checking..." : "Print Document"}
        </button>

        {/* 💬 MESSAGE */}
        {message && (
          <p style={{ marginTop: "12px", fontSize: "14px" }}>
            {message}
          </p>
        )}

        {/* 🔙 BACK */}
        <button
          onClick={() => setPage("home")}
          style={{
            marginTop: "20px",
            background: "none",
            border: "none",
            color: colors.primary,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ⬅ Back
        </button>
      </div>
    </div>
  );
}

export default KioskScreen;