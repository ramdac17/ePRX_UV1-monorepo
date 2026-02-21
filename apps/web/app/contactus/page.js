"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
export default function ContactPage() {
    const [status, setStatus] = useState("IDLE");
    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus("SENDING...");
        // Simulate API call
        setTimeout(() => setStatus("MESSAGE_SENT"), 2000);
    };
    return (<div style={styles.container}>
      <div style={styles.titleContainer}>
        <div style={styles.logoContainer} className="logo-glow">
          <img src="/ePRE1.png" alt="PRX Logo" style={styles.brandLogo}/>
        </div>
        <h1 style={styles.title}>
          CONTACT <span style={{ color: "#d4ff00" }}>PRX</span>
        </h1>
        <p style={styles.subtitle}>ESTABLISH_COMMUNICATION_LINK</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.wrapper}>
        {/* Left Side: Info */}
        <div style={styles.infoSection}>
          <div style={styles.details}>
            <div style={styles.detailItem}>
              <span style={styles.label}>ENCRYPTED_EMAIL</span>
              <span style={styles.value}>support@eprx-v3.com</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>SECURE_LINE</span>
              <span style={styles.value}>+1 (555) 010-9982</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>HQ_COORDINATES</span>
              <span style={styles.value}>NEON_DISTRICT, BLOCK 7</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={styles.formSection}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>OPERATOR_NAME</label>
              <input type="text" required style={styles.input} placeholder="ENTER NAME..."/>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>RETURN_PATH (EMAIL)</label>
              <input type="email" required style={styles.input} placeholder="ENTER EMAIL..."/>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>TRANSMISSION_DATA</label>
              <textarea required style={styles.textarea} placeholder="WRITE MESSAGE..." rows={3} // Reduced rows
    />
            </div>

            <motion.button whileHover={{ scale: 1.02, backgroundColor: "#fff" }} whileTap={{ scale: 0.98 }} style={styles.button} disabled={status !== "IDLE"}>
              {status === "IDLE" ? "SEND MESSAGE" : status}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>);
}
const styles = {
    container: {
        backgroundColor: "#0a0a0a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 8%",
        color: "#fff",
    },
    titleContainer: {
        textAlign: "center",
        marginBottom: "40px",
    },
    wrapper: {
        width: "100%",
        maxWidth: "1100px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        backgroundColor: "#0f0f0f",
        padding: "40px",
        border: "1px solid #1a1a1a",
    },
    infoSection: {
        display: "flex",
        flexDirection: "column",
        gap: "40px",
    },
    logoContainer: {
        width: "100px",
        height: "100px",
        backgroundColor: "#fff",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 40px auto",
        border: "2px solid #d4ff00",
        overflow: "hidden",
        marginTop: "40px",
    },
    brandLogo: {
        width: "70%",
        height: "70%",
        objectFit: "contain",
    },
    title: {
        fontFamily: "var(--font-bebas)",
        fontSize: "4rem",
        letterSpacing: "5px",
        margin: 0,
        fontWeight: "800",
    },
    subtitle: {
        fontSize: "0.8rem",
        letterSpacing: "4px",
        color: "#444",
        marginTop: "10px",
        fontWeight: "bold",
    },
    details: {
        display: "flex",
        flexDirection: "column",
        gap: "25px",
    },
    detailItem: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },
    label: {
        fontSize: "0.5rem",
        color: "#d4ff00",
        letterSpacing: "2px",
        opacity: 0.8,
    },
    value: {
        fontSize: "1rem",
        letterSpacing: "1px",
        color: "#eee",
    },
    formSection: {
        backgroundColor: "#111",
        padding: "25px", // Reduced padding
        border: "1px solid #222",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "18px", // Reduced gap
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    inputLabel: {
        fontSize: "0.55rem",
        letterSpacing: "2px",
        color: "#444",
    },
    input: {
        backgroundColor: "transparent",
        border: "none",
        borderBottom: "1px solid #333",
        padding: "10px 0",
        color: "#fff",
        outline: "none",
        fontSize: "0.9rem",
        letterSpacing: "1px",
    },
    textarea: {
        backgroundColor: "transparent",
        border: "1px solid #333",
        padding: "15px",
        color: "#fff",
        outline: "none",
        fontSize: "0.9rem",
        resize: "none",
    },
    button: {
        marginTop: "10px",
        padding: "14px", // Reduced padding
        backgroundColor: "#d4ff00",
        color: "#000",
        border: "none",
        fontWeight: "bold",
        letterSpacing: "3px",
        cursor: "pointer",
        fontSize: "0.75rem",
    },
};
