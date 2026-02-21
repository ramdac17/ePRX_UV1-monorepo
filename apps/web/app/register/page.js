"use client";
import React, { useState, Suspense } from "react"; // Added Suspense
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const RegisterForm = () => {
    // Renamed for internal use
    const router = useRouter();
    // ✅ MOVED INSIDE: Hooks must be inside the component
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState("error");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        mobile: "",
        username: "",
    });
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/register`, formData);
            setToastMsg("CREATE NEW ACCOUNT: SUCCESSFUL. Please check your email to activate.");
            setToastType("success"); // ✅ Changed from "error" to "success"
            setShowToast(true);
            setTimeout(() => {
                router.push("/login");
            }, 4000); // Give them slightly more time to read the success message
        }
        catch (error) {
            const msg = error.response?.data?.message || "REGISTRATION_FAILED";
            setToastMsg(msg.toUpperCase());
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
            <h1 style={styles.title}>NEW RECRUIT</h1>
            <p style={styles.subtitle}>Join the ePRX UV1 ecosystem.</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.inputContainer}>
                <label style={styles.label}>FIRST NAME</label>
                <input type="text" placeholder="FIRST NAME" style={styles.input} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required/>
              </div>
              <div style={styles.inputContainer}>
                <label style={styles.label}>LAST NAME</label>
                <input type="text" placeholder="LAST NAME" style={styles.input} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required/>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputContainer}>
                <label style={styles.label}>USER NAME</label>
                <input type="text" placeholder="USER NAME" style={styles.input} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required/>
              </div>
              <div style={styles.inputContainer}>
                <label style={styles.label}>MOBILE</label>
                <input type="text" placeholder="MOBILE" style={styles.input} value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} required/>
              </div>
            </div>

            <div style={styles.inputContainer}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input type="email" placeholder="EMAIL@DOMAIN.COM" style={styles.input} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required/>
            </div>

            <div style={styles.inputContainer}>
              <label style={styles.label}>PASSWORD</label>
              <input type="password" placeholder="••••••••" style={styles.input} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required/>
            </div>

            <button type="submit" disabled={loading} style={{
            ...styles.submitBtn,
            backgroundColor: isHovered ? "#fff" : "transparent",
            color: isHovered ? "#000" : "#fff",
            borderColor: isHovered ? "#fff" : "#333",
            opacity: loading ? 0.5 : 1,
        }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
              {loading ? "PROCESSING..." : "CREATE ACCOUNT →"}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>ALREADY REGISTERED?</p>
            <Link href="/login" style={styles.loginLink}>
              SIGN IN
            </Link>
          </div>
        </div>
      </div>

      <div style={styles.visualSide}>
        <div style={styles.overlay}>
          <div style={styles.verticalText}>ePRX_UV1 CORE</div>
          <h2 style={styles.brandingTitle}>
            THE <br />
            <span style={{ color: "#d4ff00" }}>NEXT</span> GEN
          </h2>
        </div>
      </div>

      {/* ✅ Toast remains here, correctly using state */}
      <Toast isVisible={showToast} message={toastMsg} type={toastType} onClose={() => setShowToast(false)}/>
    </div>);
};
const styles = {
    container: {
        display: "flex",
        width: "100%",
        minHeight: "100vh", // Changed to minHeight
        backgroundColor: "#0f0f0f",
        color: "#fff",
        paddingTop: "80px", // Account for Navbar
        boxSizing: "border-box",
    },
    formSide: {
        flex: "1",
        display: "flex",
        alignItems: "flex-start", // Align to top
        justifyContent: "center",
        padding: "20px 40px",
    },
    formWrapper: { width: "100%", maxWidth: "380px" },
    header: { marginBottom: "25px" }, // Reduced margin
    num: { color: "#d4ff00", fontSize: "0.8rem", fontWeight: "700" },
    title: { fontSize: "2.5rem", letterSpacing: "2px", margin: "5px 0" }, // Smaller font
    subtitle: { color: "#666", fontSize: "0.75rem", lineHeight: "1.4" },
    row: { display: "flex", gap: "15px" }, // Added for side-by-side inputs
    inputContainer: { marginBottom: "15px", flex: 1 }, // Reduced margin
    label: {
        display: "block",
        fontSize: "0.6rem",
        letterSpacing: "1px",
        color: "#444",
        marginBottom: "4px",
    },
    input: {
        width: "100%",
        backgroundColor: "transparent",
        border: "none",
        borderBottom: "1px solid #222",
        color: "#fff",
        padding: "8px 0",
        fontSize: "0.9rem",
        outline: "none",
    },
    submitBtn: {
        width: "100%",
        padding: "14px",
        border: "1px solid",
        fontSize: "0.7rem",
        letterSpacing: "3px",
        cursor: "pointer",
        transition: "0.4s ease",
        marginTop: "10px",
    },
    visualSide: {
        flex: "1.2",
        backgroundImage: 'url("https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        minHeight: "100vh",
    },
    overlay: {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px",
        textAlign: "right",
    },
    verticalText: {
        transform: "rotate(90deg)",
        transformOrigin: "right top",
        fontSize: "0.6rem",
        letterSpacing: "5px",
        color: "#ccc",
    },
    brandingTitle: { fontSize: "4rem", lineHeight: "0.9", letterSpacing: "2px" },
    footer: {
        marginTop: "20px",
        borderTop: "1px solid #1a1a1a",
        paddingTop: "20px",
    },
    footerText: { fontSize: "0.6rem", color: "#444", marginBottom: "5px" },
    loginLink: { color: "#d4ff00", fontSize: "0.7rem", textDecoration: "none" },
};
export default function Register() {
    return (<Suspense fallback={<div>LOADING_INTERFACE...</div>}>
      <RegisterForm />
    </Suspense>);
}
