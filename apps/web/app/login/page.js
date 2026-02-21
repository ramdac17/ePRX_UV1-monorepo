"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Toast from "@/components/Toast";
import api from "@/lib/api";
const LoginForm = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState("error");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const redirectTo = searchParams.get("redirect") || "/dashboard";
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", formData);
            const userData = data.user ? data.user : data;
            if (userData.emailVerified === false) {
                setToastMsg("IDENTITY_LOCKED: Please verify your email.");
                setToastType("error");
                setShowToast(true);
                setLoading(false);
                return;
            }
            login(userData, data.token);
            setToastMsg("ACCESS_GRANTED: INITIALIZING...");
            setToastType("success");
            setShowToast(true);
            setTimeout(() => {
                router.push(redirectTo);
                router.refresh();
            }, 1200);
        }
        catch (error) {
            const message = error.response?.data?.message || "TRANSMISSION_ERROR";
            setToastMsg(message.toUpperCase());
            setToastType("error");
            setShowToast(true);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div style={styles.container}>
      <div style={styles.formSide}>
        <div style={styles.formWrapper}>
          <div style={styles.header}>
            <h1 style={styles.title}>RETURNING RUNNER</h1>
            <p style={styles.subtitle}>
              Enter credentials for performance dashboard access.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputContainer}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input type="email" style={styles.input} placeholder="runner@eprx.uv1" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required/>
            </div>

            <div style={styles.inputContainer}>
              <label style={styles.label}>PASSWORD</label>
              <input type="password" style={styles.input} placeholder="••••••••" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required/>
            </div>

            <button type="submit" disabled={loading} style={{
            ...styles.loginBtn,
            backgroundColor: isHovered ? "#fff" : "transparent",
            color: isHovered ? "#000" : "#fff",
            borderColor: isHovered ? "#fff" : "#333",
            opacity: loading ? 0.5 : 1,
        }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
              {loading ? "VERIFYING..." : "SIGN IN →"}
            </button>
          </form>

          {/* Styled Extras: Remember & Forgot */}
          <div style={styles.authExtras}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" style={styles.checkbox}/>
              <span style={styles.checkboxText}>REMEMBER_SESSION</span>
            </label>
            <Link href="/forgot-password" style={styles.forgotLink}>
              RECOVERY_PROTOCOL?
            </Link>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>NEW TO THE CIRCLE?</p>
            <Link href="/register" style={styles.registerLink}>
              CREATE AN ACCOUNT
            </Link>
          </div>
        </div>
      </div>

      <div style={styles.visualSide}>
        <div style={styles.overlay}>
          <div style={styles.verticalText}>ePRX SECURITY</div>
          <h2 style={styles.brandingTitle}>
            THE <br /> <span style={{ color: "#d4ff00" }}>INNER</span> CIRCLE
          </h2>
        </div>
      </div>

      <Toast isVisible={showToast} message={toastMsg} type={toastType} onClose={() => setShowToast(false)}/>
    </div>);
};
const styles = {
    container: {
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0f0f0f",
        color: "#fff",
        overflow: "hidden",
    },
    formSide: {
        flex: "0.85",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
    },
    formWrapper: { width: "100%", maxWidth: "360px" },
    header: { marginBottom: "30px" },
    title: {
        fontFamily: "var(--font-bebas)",
        fontSize: "3rem",
        letterSpacing: "3px",
        lineHeight: "1",
        marginBottom: "10px",
    },
    subtitle: {
        fontFamily: "var(--font-inter)",
        color: "#666",
        fontSize: "0.85rem",
    },
    inputContainer: { marginBottom: "20px" },
    label: {
        display: "block",
        fontSize: "0.65rem",
        letterSpacing: "2px",
        color: "#444",
        marginBottom: "8px",
    },
    input: {
        width: "100%",
        backgroundColor: "transparent",
        border: "none",
        borderBottom: "1px solid #222",
        color: "#fff",
        padding: "10px 0",
        fontSize: "1rem",
        outline: "none",
    },
    loginBtn: {
        width: "100%",
        padding: "16px",
        border: "1px solid",
        fontSize: "0.75rem",
        letterSpacing: "4px",
        cursor: "pointer",
        transition: "0.4s",
        marginTop: "10px",
    },
    visualSide: {
        flex: "1.15",
        backgroundImage: 'url("https://images.unsplash.com/photo-1538370965046-79c0d6907d47?q=80&w=2070")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
    },
    overlay: {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px",
        textAlign: "right",
    },
    verticalText: {
        transform: "rotate(90deg)",
        transformOrigin: "right top",
        fontSize: "0.7rem",
        letterSpacing: "5px",
        color: "#ccc",
        marginTop: "100px",
    },
    brandingTitle: {
        fontSize: "4.5rem",
        lineHeight: "0.9",
        letterSpacing: "2px",
    },
    footer: {
        marginTop: "30px",
        borderTop: "1px solid #1a1a1a",
        paddingTop: "20px",
    },
    footerText: {
        fontSize: "0.65rem",
        color: "#444",
        letterSpacing: "2px",
        marginBottom: "5px",
    },
    registerLink: {
        color: "#d4ff00",
        fontSize: "0.75rem",
        textDecoration: "none",
        letterSpacing: "1px",
        fontWeight: "600",
    },
    authExtras: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        fontSize: "0.65rem",
    },
    checkboxLabel: {
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        gap: "8px",
        color: "#666",
    },
    checkbox: { accentColor: "#d4ff00", cursor: "pointer" },
    checkboxText: { fontFamily: "var(--font-inter)" },
    forgotLink: { color: "#666", textDecoration: "none", transition: "0.3s" },
};
export default function LoginPage() {
    return (<Suspense fallback={<div style={{ backgroundColor: "#0f0f0f", height: "100vh" }}/>}>
      <LoginForm />
    </Suspense>);
}
