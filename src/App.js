import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    if (isSignUp) {
      return (
        <SignUp
          onSignUp={(user) => setUser(user)}
          switchToLogin={() => setIsSignUp(false)}
        />
      );
    }
    return (
      <Login
        onLogin={(user) => setUser(user)}
        switchToSignUp={() => setIsSignUp(true)}
      />
    );
  }

  return <Dashboard user={user} />;
};

export default App;
