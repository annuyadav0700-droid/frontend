import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Profile({ user, logout, setPage }) {
  const [userData, setUserData] = useState(null);

  // 🔥 Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <div style={{ padding: "20px", paddingBottom: "80px" }}>
      
      {/* 🔙 Back */}
      <button
        onClick={() => setPage("home")}
        style={{
          background: "none",
          border: "none",
          color: "#2563EB",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "16px",
          marginBottom: "10px",
        }}
      >
        ⬅ Back
      </button>

      {/* 👤 PROFILE CARD */}
      <div
        style={{
          marginTop: "20px",
          padding: "30px",
          borderRadius: "24px",
          background: "#FFFFFF",
          border: "1px solid #EAF2FF",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "40px" }}>👤</div>

        <h2>My Profile</h2>

        <p>
          <strong>Name:</strong>{" "}
          {userData?.name || "Not Available"}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {userData?.phone || "Not Available"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user.email || "Not Available"}
        </p>

        {/* 🚪 Logout */}
        <button
          onClick={logout}
          className="pay-btn"
          style={{
            marginTop: "20px",
            background: "#EF4444"
          }}
        >
          Logout
        </button>
      </div>

      {/* 💬 HELP SECTION */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <p style={{ color: "#888" }}>Need help?</p>

        <button
          onClick={() =>
            window.open("https://wa.me/919999999999", "_blank") // 👉 अपना नंबर डालना
          }
          className="pay-btn"
          style={{
            background: "#25D366",
            width: "auto"
          }}
        >
          💬 Chat on WhatsApp
        </button>
      </div>
    </div>
  );
}

export default Profile;