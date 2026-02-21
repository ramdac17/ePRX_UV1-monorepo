"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
const ForgotPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState("error");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!response.ok)
                throw new Error("RECOVERY_REQUEST_FAILED");
            setToastMsg("RECOVERY_SIGNAL_SENT: CHECK YOUR INBOX");
            setToastType("success");
            setShowToast(true);
            // Optional: auto-redirect after success
            setTimeout(() => router.push("/login"), 3000);
        }
        catch (err) {
            setToastMsg("TRANSMISSION_FAILED: UNABLE TO REACH CORE");
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
            <h1 style={styles.title}>RECOVERY_MODE</h1>
            <p style={styles.subtitle}>
              INITIATING SECURE HANDSHAKE TO RESTORE RUNNER ACCESS.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputContainer}>
              <label style={styles.label}>REGISTERED EMAIL</label>
              <input type="email" style={styles.input} placeholder="runner@eprx.uv1" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </div>

            <button type="submit" disabled={loading} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{
            ...styles.recoveryBtn,
            backgroundColor: isHovered ? "#fff" : "transparent",
            color: isHovered ? "#000" : "#fff",
            borderColor: isHovered ? "#fff" : "#333",
            opacity: loading ? 0.5 : 1,
        }}>
              {loading ? "TRANSMITTING..." : "SEND_RECOVERY_LINK →"}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>REMEMBERED YOUR KEY?</p>
            <Link href="/login" style={styles.loginLink}>
              RETURN_TO_LOGIN
            </Link>
          </div>
        </div>
      </div>

      <div style={styles.visualSide}>
        <div style={styles.overlay}>
          <div style={styles.verticalText}>SIGNAL TRACE</div>
          <h2 style={styles.brandingTitle}>
            LOST <br />
            <span style={{ color: "#d4ff00" }}>IDENTITY</span>
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
    recoveryBtn: {
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
        backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072")',
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
    loginLink: {
        color: "#d4ff00",
        fontSize: "0.75rem",
        textDecoration: "none",
        letterSpacing: "1px",
        fontWeight: "600",
    },
};
export default ForgotPasswordForm;
