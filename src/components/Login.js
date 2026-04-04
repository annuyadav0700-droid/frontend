import React from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function Login() {
    

  const login = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);
      alert("Login Success");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>A4Station Login</h2>
      <button onClick={login}>Login with Google</button>
    </div>
  );
}

export default Login;