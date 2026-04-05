import React, { useState } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import colors from "../theme/colors";

function CompleteProfile({ setProfileDone }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
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
          padding: "30px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
        }}
      >
        {/* HEADER */}
        <h2 style={{ color: colors.dark }}>Complete Your Profile</h2>
        <p style={{ fontSize: "14px", color: colors.gray }}>
          Just a few details to get started 🚀
        </p>

        {/* NAME */}
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #EAF2FF",
            outline: "none",
          }}
        />

        {/* PHONE */}
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #EAF2FF",
            outline: "none",
          }}
        />

        {/* BUTTON */}
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            background: colors.primary,
            color: colors.white,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : "Continue"}
        </button>

        {/* TRUST TEXT */}
        <p
          style={{
            marginTop: "15px",
            fontSize: "12px",
            color: colors.gray,
            textAlign: "center",
          }}
        >
          Your details are safe and secure 🔒
        </p>
      </div>
    </div>
  );
}

export default CompleteProfile;