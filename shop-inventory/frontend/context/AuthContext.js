"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, setToken, clearToken } from "@/lib/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) return setLoading(false);
    api.me().then(setUser).catch(clearToken).finally(() => setLoading(false));
  }, []);

  const authenticate = async (promise) => {
    const { token, user } = await promise;
    setToken(token);
    setUser(user);
  };

  const login = (body) => authenticate(api.login(body));
  const register = (body) => authenticate(api.register(body));
  const logout = () => {
    clearToken();
    setUser(null);
    router.push("/login");
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
