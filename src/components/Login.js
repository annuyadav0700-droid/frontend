import React, { useState } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import colors from "../theme/colors";

function Login() {
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const provider = new GoogleAuthProvider();

    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);
    } catch (error) {
      console.error(error);
      alert("Login failed ❌");
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
          textAlign: "center",
        }}
      >
        {/* 🔷 LOGO / TITLE */}
        <h2 style={{ color: colors.dark }}>A4Station</h2>
        <p style={{ color: colors.gray, fontSize: "14px" }}>
          Print your documents in seconds 🚀
        </p>

        {/* 🔐 BUTTON */}
        <button
          onClick={login}
          disabled={loading}
          style={{
            marginTop: "25px",
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #EAF2FF",
            background: colors.white,
            color: colors.dark,
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        {/* 💡 FOOTER */}
        <p
          style={{
            marginTop: "20px",
            fontSize: "12px",
            color: "#94A3B8",
          }}
        >
          Fast • Secure • Easy Printing
        </p>
      </div>
    </div>
  );
}

export default Login;