"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Toast from "@/components/Toast";
const ResetForm = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState("error");
    useEffect(() => {
        if (!token) {
            router.push("/login");
        }
    }, [token, router]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setToastMsg("VALIDATION_ERROR: PASSWORDS_DO_NOT_MATCH");
            setToastType("error");
            setShowToast(true);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "RESET_FAILED");
            }
            setToastMsg("CREDENTIALS_UPDATED: RE-INITIALIZING_LOGIN...");
            setToastType("success");
            setShowToast(true);
            setTimeout(() => router.push("/login"), 2500);
        }
        catch (err) {
            setToastMsg(err.message?.toUpperCase() || "TRANSMISSION_ERROR");
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
            <h1 style={styles.title}>RESET_PASSWORD</h1>
            <p style={styles.subtitle}>
              ESTABLISHING NEW SECURITY CREDENTIALS FOR YOUR RUNNER ID.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputContainer}>
              <label style={styles.label}>NEW PASSWORD</label>
              <input type="password" style={styles.input} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/>
            </div>

            <div style={styles.inputContainer}>
              <label style={styles.label}>CONFIRM NEW PASSWORD</label>
              <input type="password" style={styles.input} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
            </div>

            <button type="submit" disabled={loading} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{
            ...styles.resetBtn,
            backgroundColor: isHovered ? "#fff" : "transparent",
            color: isHovered ? "#000" : "#fff",
            borderColor: isHovered ? "#fff" : "#333",
            opacity: loading ? 0.5 : 1,
        }}>
              {loading ? "PATCHING_CORE..." : "CONFIRM_NEW_CREDENTIALS →"}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>ABORT MISSION?</p>
            <button onClick={() => router.push("/login")} style={styles.backLink}>
              RETURN_TO_LOGIN
            </button>
          </div>
        </div>
      </div>

      <div style={styles.visualSide}>
        <div style={styles.overlay}>
          <div style={styles.verticalText}>SYSTEM OVERRIDE</div>
          <h2 style={styles.brandingTitle}>
            SECURE <br />
            <span style={{ color: "#d4ff00" }}>ACCESS</span>
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
        fontSize: "0.75rem",
        lineHeight: "1.4",
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
    resetBtn: {
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
        backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
    },
    overlay: {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
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
    backLink: {
        backgroundColor: "transparent",
        border: "none",
        color: "#d4ff00",
        fontSize: "0.75rem",
        letterSpacing: "1px",
        fontWeight: "600",
        cursor: "pointer",
        padding: 0,
    },
    loader: { backgroundColor: "#0f0f0f", height: "100vh" },
};
export default function ResetPasswordPage() {
    return (<Suspense fallback={<div style={styles.loader}/>}>
      <ResetForm />
    </Suspense>);
}
