"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
export const AuthGuard = ({ children }) => {
    // ✅ We are destructuring 'user' here
    const { user, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        // ✅ Fix: Changed 'authUser' to 'user'
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);
    // ✅ Fix: Changed 'authUser' to 'user'
    if (loading || !user) {
        return (<div style={styles.loaderContainer}>
        <p style={styles.loaderText}>AUTHENTICATING_IDENTITY...</p>
      </div>);
    }
    return <>{children}</>;
};
const styles = {
    loaderContainer: {
        height: "100vh",
        backgroundColor: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    loaderText: {
        color: "#d4ff00",
        letterSpacing: "4px",
        fontSize: "0.8rem",
    },
};
