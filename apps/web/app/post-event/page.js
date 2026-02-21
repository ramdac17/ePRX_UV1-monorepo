"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
export default function PostEventPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    // ePRX UV1: Dedicated Backend Port
    const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login?redirect=/post-event");
            }
            else {
                setCheckingAuth(false);
            }
        }
    }, [user, loading, router]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // MAINTAIN STRUCTURE: Capture data via FormData
        const formElement = e.currentTarget;
        const formData = new FormData(formElement);
        try {
            // MATCH CONDITION: Point to the dedicated Events Controller
            const response = await fetch(`${BACKEND_API}/events`, {
                method: "POST",
                // Browser sets multipart boundary automatically; do not set Content-Type header manually
                body: formData,
            });
            if (response.ok) {
                // Redirect to the events mission board
                router.push("/events");
                router.refresh();
            }
            else {
                const errorData = await response.json();
                alert(`BROADCAST_FAILED: ${errorData.message || "Invalid Mission Data"}`);
            }
        }
        catch (error) {
            console.error("CONNECTION_ERROR:", error);
            alert("CRITICAL_ERROR: Uplink to Command Center failed.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (loading || checkingAuth) {
        return (<div style={styles.loadingContainer}>
        <h2 style={styles.loadingText}>INITIALIZING_SECURE_SESSION...</h2>
      </div>);
    }
    return (<div style={styles.pageContainer}>
      <h1 style={styles.mainTitle}>
        POST <span style={{ color: "#d4ff00" }}>EVENT</span>
      </h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={styles.sectionTitle}>|| EVENT SPECS</h3>

        {/* MATCH CONDITION: Added field for the Controller's FileInterceptor('image') */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>MISSION_VISUAL (OPTIONAL)</label>
          <input type="file" name="image" accept="image/*" style={styles.input}/>
        </div>

        <div style={styles.fieldRow}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>EVENT TITLE - Required</label>
            <input name="title" required style={styles.input} placeholder="EVENT TITLE"/>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>DATE & TIME</label>
            <input name="date" type="datetime-local" required style={styles.input}/>
          </div>
        </div>

        <div style={styles.fieldRow}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>LOCATION - Required</label>
            <input name="location" required style={styles.input} placeholder="LOCATION"/>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>ORGANIZER - Required</label>
            <input name="organizer" required style={styles.input} placeholder="ORGANIZER"/>
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>DESCRIPTION - Required</label>
          <textarea name="description" required style={styles.textarea} placeholder="MISSION BRIEFING..."/>
        </div>

        <h3 style={styles.sectionTitle}>|| CONTACT INTEL</h3>
        <div style={styles.fieldRow}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>FIRST NAME - Required</label>
            <input name="firstName" required style={styles.input} placeholder="FIRST NAME"/>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>LAST NAME - Required</label>
            <input name="lastName" required style={styles.input} placeholder="LAST NAME"/>
          </div>
        </div>
        <div style={styles.fieldRow}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>EMAIL - Required</label>
            <input name="email" type="email" required style={styles.input} placeholder="EMAIL"/>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>MOBILE - Required</label>
            <input name="mobile" type="tel" required style={styles.input} placeholder="MOBILE"/>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} style={{
            ...styles.submitBtn,
            opacity: isSubmitting ? 0.5 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
        }}>
          {isSubmitting ? "TRANSMITTING..." : "BROADCAST TO MISSION BOARD"}
        </button>
      </form>
    </div>);
}
// ... styles remain identical to your original provided CSS ...
const styles = {
    pageContainer: {
        backgroundColor: "#050505",
        minHeight: "100vh",
        padding: "40px 8%",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    loadingContainer: {
        backgroundColor: "#050505",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontFamily: "monospace",
        color: "#d4ff00",
        fontSize: "1rem",
        letterSpacing: "4px",
    },
    mainTitle: {
        fontFamily: "var(--font-bebas)",
        fontSize: "3rem",
        marginBottom: "20px",
        textAlign: "center",
    },
    sectionTitle: {
        fontSize: "0.7rem",
        color: "#d4ff00",
        letterSpacing: "3px",
        borderBottom: "1px solid #222",
        paddingBottom: "8px",
        marginTop: "10px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        maxWidth: "800px",
        width: "100%",
    },
    fieldRow: { display: "flex", gap: "15px" },
    fieldGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
    label: { fontSize: "0.55rem", color: "#666", letterSpacing: "1px" },
    input: {
        backgroundColor: "#111",
        border: "1px solid #333",
        padding: "8px",
        color: "#fff",
        outline: "none",
        flex: 1,
        fontSize: "0.85rem",
    },
    textarea: {
        backgroundColor: "#111",
        border: "1px solid #333",
        padding: "8px",
        color: "#fff",
        minHeight: "60px",
        outline: "none",
        fontSize: "0.85rem",
    },
    submitBtn: {
        backgroundColor: "#d4ff00",
        color: "#000",
        border: "none",
        padding: "12px",
        fontFamily: "var(--font-bebas)",
        fontSize: "1.1rem",
        marginTop: "10px",
        fontWeight: "bold",
    },
};
