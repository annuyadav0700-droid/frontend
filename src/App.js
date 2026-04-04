import React, { useState, useEffect } from "react";

// 🔐 Firebase
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// 📦 Components
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PrintPage from "./components/PrintPage";
import History from "./components/History";
import Profile from "./components/Profile";

function App() {
  // 🔐 AUTH STATE
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 📄 APP NAVIGATION
  const [page, setPage] = useState("dashboard");

  // 📊 ORDERS (temporary state)
  const [orders, setOrders] = useState([]);

  // 🔐 CHECK LOGIN
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚪 LOGOUT
  const handleLogout = () => {
    signOut(auth);
  };

  // ⏳ LOADING
  if (loading) {
    return <h2>Loading...</h2>;
  }

  // 🔒 NOT LOGGED IN
  if (!user) {
    return <Login />;
  }

  // 🏠 DASHBOARD
  if (page === "dashboard") {
    return <Dashboard user={user} setPage={setPage} />;
  }

  // 🖨️ PRINT PAGE
  if (page === "print") {
    return (
      <PrintPage
        setPage={setPage}
        setOrders={setOrders}
      />
    );
  }

  // 📄 HISTORY
  if (page === "history") {
    return (
      <History
        orders={orders}
        setPage={setPage}
      />
    );
  }

  // 👤 PROFILE
  if (page === "profile") {
    return (
      <Profile
        user={user}
        logout={handleLogout}
        setPage={setPage}
      />
    );
  }

  // 🔁 FALLBACK
  return <Dashboard user={user} setPage={setPage} />;
}

export default App;