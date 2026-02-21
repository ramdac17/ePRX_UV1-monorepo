"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Load session on mount
    useEffect(() => {
        const loadSession = () => {
            try {
                const savedUser = localStorage.getItem("eprx_session");
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            }
            catch (e) {
                console.error("SESSION_CORRUPT:", e);
                localStorage.removeItem("eprx_session");
            }
            finally {
                setLoading(false);
            }
        };
        loadSession();
    }, []);
    // Updated login to accept both user info and the JWT string
    const login = (userData, token) => {
        // Merge the token INTO the user object so it's saved in localStorage
        const sessionData = { ...userData, token };
        setUser(sessionData);
        localStorage.setItem("eprx_session", JSON.stringify(sessionData));
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem("eprx_session");
    };
    return (<AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }
    return context;
}
