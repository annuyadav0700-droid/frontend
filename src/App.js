import React, { useState, useEffect } from "react";

// 🔐 Firebase
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// 🔥 Firestore
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// 📦 Components
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PrintPage from "./components/PrintPage";
import History from "./components/History";
import Profile from "./components/Profile";
import KioskPage from "./components/KioskPage";
import KioskScreen from "./components/KioskScreen";
import BottomNav from "./components/BottomNav";
import CompleteProfile from "./components/CompleteProfile";

function App() {
  // 🔐 AUTH STATE
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 📄 NAVIGATION
  const [page, setPage] = useState("home");

  // 📊 ORDERS
  const [orders, setOrders] = useState([]);

  // 👤 PROFILE CHECK
  const [profileDone, setProfileDone] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // 🔐 AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 👤 CHECK PROFILE (VERY IMPORTANT)
  useEffect(() => {
  const checkProfile = async () => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);

      // 🔥 timeout protection
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject("timeout"), 5000)
      );

      const docSnap = await Promise.race([
        getDoc(docRef),
        timeout,
      ]);

      if (docSnap && docSnap.exists && docSnap.exists()) {
        setProfileDone(true);
      } else {
        setProfileDone(false);
      }

    } catch (error) {
      console.error("Profile error:", error);
      setProfileDone(false);
    }

    // 🔥 NEVER STUCK AGAIN
    setCheckingProfile(false);
  };

  checkProfile();
}, [user]);

  // 📥 FETCH ORDERS
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, "orders"));

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (user && profileDone) {
      fetchOrders();
    }
  }, [user, profileDone]);

  // 🚪 LOGOUT
  const handleLogout = () => {
    signOut(auth);
  };

  // ⏳ LOADING
  if (loading || checkingProfile) {
    return <h2>Loading...</h2>;
  }

  // 🔒 NOT LOGGED IN
  if (!user) {
    return <Login />;
  }

  // 🔥 NEW USER → COMPLETE PROFILE
  if (!profileDone) {
    return <CompleteProfile setProfileDone={setProfileDone} />;
  }

  // 🎯 MAIN APP UI
  return (
    <>
      {/* 🏠 HOME */}
      {page === "home" && (
        <Dashboard user={user} setPage={setPage} />
      )}

      {/* 📤 UPLOAD → KIOSK */}
      {page === "upload" && (
        <KioskPage setPage={setPage} />
      )}

      {/* 🖨️ PRINT */}
      {page === "print" && (
        <PrintPage setPage={setPage} setOrders={setOrders} />
      )}

      {/* 📄 ORDERS */}
      {page === "orders" && (
        <History orders={orders} setPage={setPage} />
      )}

      {/* 👤 PROFILE */}
      {page === "profile" && (
        <Profile user={user} logout={handleLogout} setPage={setPage} />
      )}

      {/* 🖥️ KIOSK SCREEN */}
      {page === "kioskScreen" && (
        <KioskScreen setPage={setPage} />
      )}

      {/* 🔥 BOTTOM NAV */}
      <BottomNav page={page} setPage={setPage} />
    </>
  );
}

export default App;