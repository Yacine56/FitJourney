import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // null = not logged in
  const [loading, setLoading] = useState(true);

  // Check session on first load (cookie-based)
  useEffect(() => {
    fetch("http://localhost:5000/api/auth/me", { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setUser(d?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  const value = { user, setUser, logout, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
