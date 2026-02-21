"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // ePRX UV1 Connection Protocol
    const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const STATIC_URL = BACKEND_API.replace("/api", "");
    useEffect(() => {
        async function fetchEvent() {
            if (!params.id)
                return;
            try {
                setLoading(true);
                // FETCH POINT: Targeting dedicated Events Controller on Port 3001
                const response = await fetch(`${BACKEND_API}/events/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setEvent(data);
                }
                else {
                    setError("MISSION_INTEL_NOT_FOUND");
                }
            }
            catch (err) {
                setError("UPLINK_FAILURE");
            }
            finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [params.id, BACKEND_API]);
    if (loading) {
        return (<div style={styles.loadingContainer}>
        <h2 style={styles.loadingText}>DECRYPTING_MISSION_STREAM...</h2>
      </div>);
    }
    if (error || !event) {
        return (<div style={styles.errorContainer}>
        <h2 style={styles.errorText}>
          // ERROR: {error || "RESOURCE_NOT_FOUND"}
        </h2>
        <Link href="/live-events" style={styles.backLink}>
          RETURN_TO_BASE
        </Link>
      </div>);
    }
    return (<div style={styles.pageContainer}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.articleWrapper}>
        <header style={styles.header}>
          <div style={styles.meta}>
            <span style={styles.category}>LIVE_EVENT</span>
            <span style={styles.divider}> //</span>
    //</span>
            <span style={styles.date}>
              {new Date(event.date)
            .toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        })
            .toUpperCase()}
            </span>
          </div>
          <h1 style={styles.title}>{event.title.toUpperCase()}</h1>

          <div style={styles.intelGrid}>
            <div style={styles.intelItem}>
              <span style={styles.authorLabel}>LOCATION:</span>
              <span style={styles.intelValue}>
                {event.location.toUpperCase()}
              </span>
            </div>
            <div style={styles.intelItem}>
              <span style={styles.authorLabel}>ORGANIZER:</span>
              <span style={styles.intelValue}>
                {event.organizer.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {event.image && (<div style={styles.imageContainer}>
            <img src={`${STATIC_URL}/uploads/${event.image}`} alt={event.title} style={styles.heroImage}/>
          </div>)}

        <main style={styles.contentContainer}>
          <div style={styles.content}>
            <h3 style={styles.sectionTitle}>|| MISSION_BRIEFING</h3>
            {event.description.split("\n").map((paragraph, index) => (<p key={index} style={styles.paragraph}>
                {paragraph}
              </p>))}
          </div>

          <div style={styles.contactCard}>
            <h3 style={styles.sectionTitle}>|| POINT_OF_CONTACT</h3>
            <p style={styles.contactText}>
              AGENT: {event.firstName} {event.lastName}
            </p>
            <p style={styles.contactText}>COMM_LINK: {event.email}</p>
            <p style={styles.contactText}>MOBILE: {event.mobile}</p>
          </div>
        </main>

        <footer style={styles.footer}>
          <div style={styles.footerLine}></div>
          <p style={styles.footerText}>
            END_OF_TRANSMISSION // ePRX_UV1_PROTOCOL
          </p>
        </footer>
      </motion.div>
    </div>);
}
const styles = {
    pageContainer: {
        backgroundColor: "#0a0a0a",
        minHeight: "100vh",
        color: "#fff",
        padding: "100px 8% 60px",
    },
    loadingContainer: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
    },
    loadingText: {
        fontFamily: "monospace",
        color: "#d4ff00",
        letterSpacing: "4px",
    },
    errorContainer: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
        gap: "20px",
    },
    errorText: {
        fontFamily: "monospace",
        color: "#ff3e3e",
        letterSpacing: "2px",
    },
    backLink: {
        color: "#d4ff00",
        textDecoration: "none",
        fontFamily: "monospace",
        border: "1px solid #d4ff00",
        padding: "10px 20px",
    },
    articleWrapper: { maxWidth: "1000px", margin: "0 auto" },
    header: { marginBottom: "40px" },
    meta: {
        display: "flex",
        gap: "10px",
        fontSize: "0.75rem",
        color: "#d4ff00",
        fontFamily: "monospace",
        letterSpacing: "2px",
        marginBottom: "15px",
    },
    divider: { color: "#333" },
    title: {
        fontFamily: "var(--font-bebas)",
        fontSize: "5rem",
        lineHeight: "0.9",
        margin: "0 0 30px 0",
        color: "#fff",
    },
    intelGrid: {
        display: "flex",
        gap: "40px",
        borderTop: "1px solid #1a1a1a",
        paddingTop: "20px",
    },
    intelItem: { display: "flex", flexDirection: "column", gap: "5px" },
    authorLabel: {
        fontSize: "0.6rem",
        fontFamily: "monospace",
        color: "#444",
        letterSpacing: "1px",
    },
    intelValue: {
        fontSize: "0.8rem",
        fontFamily: "monospace",
        color: "#999",
        letterSpacing: "1px",
    },
    imageContainer: {
        width: "100%",
        marginBottom: "40px",
        border: "1px solid #222",
        backgroundColor: "#111",
        overflow: "hidden",
    },
    heroImage: { width: "100%", maxHeight: "70vh", objectFit: "cover" },
    contentContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "60px",
    },
    content: { fontSize: "1.05rem", lineHeight: "1.8", color: "#ccc" },
    paragraph: { marginBottom: "25px" },
    sectionTitle: {
        fontSize: "0.7rem",
        color: "#d4ff00",
        letterSpacing: "3px",
        marginBottom: "20px",
        fontFamily: "monospace",
    },
    contactCard: {
        backgroundColor: "#0f0f0f",
        padding: "30px",
        border: "1px solid #1a1a1a",
        height: "fit-content",
    },
    contactText: {
        fontSize: "0.75rem",
        fontFamily: "monospace",
        color: "#888",
        marginBottom: "10px",
    },
    footer: { marginTop: "80px", textAlign: "center" },
    footerLine: { height: "1px", backgroundColor: "#222", marginBottom: "20px" },
    footerText: {
        fontSize: "0.6rem",
        color: "#444",
        fontFamily: "monospace",
        letterSpacing: "3px",
    },
};
