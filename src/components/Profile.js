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
      <button onClick={() => setPage("home")}>⬅ Back</button>

      {/* 👤 PROFILE CARD */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "16px",
          background: "#f5f5f5",
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
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
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
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            background: "#25D366",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          💬 Chat on WhatsApp
        </button>
      </div>
    </div>
  );
}

export default Profile;