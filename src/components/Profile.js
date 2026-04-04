import React from "react";

function Profile({ user, logout, setPage }) {
  return (
    <div className="profile-page">

      {/* 🔙 Back */}
      <button className="back-btn" onClick={() => setPage("dashboard")}>
        ⬅ Back
      </button>

      {/* 👤 PROFILE CARD */}
      <div className="profile-card">
        <div className="avatar">👤</div>

        <h2>My Profile</h2>

        <p>
          <strong>Email:</strong> {user.email || "Not Available"}
        </p>

        <p>
          <strong>Phone:</strong> {user.phoneNumber || "Not Available"}
        </p>

        <p>
          <strong>User ID:</strong> {user.uid}
        </p>

        {/* 🚪 Logout */}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

    </div>
  );
}

export default Profile;