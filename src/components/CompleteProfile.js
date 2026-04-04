import React, { useState } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

function CompleteProfile({ setProfileDone }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // 🔥 VALIDATION
    if (!name.trim() || !phone.trim()) {
      alert("Please fill all details");
      return;
    }

    if (phone.length !== 10) {
      alert("Enter valid 10 digit phone number");
      return;
    }

    setLoading(true);

    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name,
        phone,
        createdAt: new Date().toISOString(),
      });

      setProfileDone(true);
    } catch (error) {
      console.error(error);
      alert("Error saving profile");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Complete Your Profile</h2>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
          Just a few details to get started 🚀
        </p>

        {/* NAME */}
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        {/* PHONE */}
        <input
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        {/* BUTTON */}
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#000",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}

export default CompleteProfile;