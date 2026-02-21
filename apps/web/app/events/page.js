"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
export default function LiveEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const STATIC_URL = BACKEND_API.replace("/api", "");
    useEffect(() => {
        async function fetchLiveEvents() {
            try {
                // 2. FETCH POINT: Direct uplink to the dedicated events controller
                const response = await fetch(`${BACKEND_API}/event`);
                if (response.ok) {
                    const data = await response.json();
                    // No more client-side filtering needed!
                    // The dedicated controller only returns events.
                    setEvents(data);
                }
            }
            catch (error) {
                console.error("EVENT_FETCH_PROTOCOL_FAILURE:", error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchLiveEvents();
    }, [BACKEND_API]);
    return (<div style={styles.pageContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          LIVE <span style={{ color: "#d4ff00" }}>EVENTS</span>
        </h1>
        <p style={styles.subtitle}>
          REAL-TIME TRANSMISSIONS AND UPCOMING STATION OPERATIONS
        </p>
      </div>

      <div style={styles.content}>
        {loading ? (<div style={styles.loadingText}>SYNCHRONIZING_LIVE_FEED...</div>) : events.length > 0 ? (<div style={styles.grid}>
            {events.map((event) => (<Link key={event.id} href={`/event/${event.id}`} // Updated path
             style={styles.cardLink}>
                <motion.div style={styles.card} whileHover={{ y: -8, borderColor: "#d4ff00" }} transition={{ type: "spring", stiffness: 300 }}>
                  <div style={styles.imageContainer}>
                    {event.image ? (<img src={`${STATIC_URL}/uploads/${event.image}`} alt={event.title} style={styles.articleImage}/>) : (<div style={styles.placeholderImage}>
                        <span style={styles.imageLabel}>NO_SIGNAL</span>
                      </div>)}
                    <div style={styles.overlayTag}>
                      {event.location.toUpperCase()}
                    </div>
                  </div>
                  <div style={styles.cardContent}>
                    <span style={styles.tag}>
                      ORGANIZER: {event.organizer} //{" "}
             //{" "}
                      {/* Using 'date' for the event time, not just 'createdAt' */}
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <h2 style={styles.cardTitle}>
                      {event.title.toUpperCase()}
                    </h2>
                    <p style={styles.cardDesc}>
                      {event.description.substring(0, 120)}...
                    </p>
                    <div style={styles.readMore}>JOIN_TRANSMISSION →</div>
                  </div>
                </motion.div>
              </Link>))}
          </div>) : (<div style={styles.noData}>NO_LIVE_TRANSMISSIONS_DETECTED</div>)}
      </div>
    </div>);
}
const styles = {
    pageContainer: {
        backgroundColor: "#050505",
        color: "#fff",
        minHeight: "100vh",
        padding: "100px 8% 60px",
    },
    header: {
        marginBottom: "60px",
        borderBottom: "1px solid #1a1a1a",
        paddingBottom: "40px",
    },
    liveIndicator: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "10px",
    },
    redDot: {
        width: "8px",
        height: "8px",
        backgroundColor: "#ff0000",
        borderRadius: "50%",
        boxShadow: "0 0 10px #ff0000",
    },
    liveText: {
        fontFamily: "monospace",
        fontSize: "0.7rem",
        color: "#ff0000",
        letterSpacing: "2px",
    },
    title: {
        fontFamily: "var(--font-bebas), sans-serif",
        fontSize: "6rem",
        margin: 0,
        lineHeight: "0.9",
        letterSpacing: "-2px",
    },
    subtitle: {
        color: "#444",
        letterSpacing: "4px",
        fontSize: "0.8rem",
        marginTop: "15px",
        fontFamily: "monospace",
    },
    content: {
        display: "flex",
        flexDirection: "column",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: "30px",
    },
    cardLink: {
        textDecoration: "none",
        color: "inherit",
        display: "block",
    },
    card: {
        backgroundColor: "#0a0a0a",
        border: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
    },
    imageContainer: {
        height: "220px",
        backgroundColor: "#111",
        overflow: "hidden",
        position: "relative",
        borderBottom: "1px solid #1a1a1a",
    },
    overlayTag: {
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: "rgba(0,0,0,0.8)",
        color: "#d4ff00",
        fontSize: "0.6rem",
        padding: "4px 8px",
        fontFamily: "monospace",
        border: "1px solid #d4ff00",
    },
    placeholderImage: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f0f0f",
    },
    imageLabel: {
        color: "#222",
        fontFamily: "var(--font-bebas)",
        fontSize: "2.5rem",
        letterSpacing: "5px",
    },
    cardContent: {
        padding: "30px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    tag: {
        color: "#d4ff00",
        fontSize: "0.65rem",
        letterSpacing: "3px",
        marginBottom: "15px",
        fontFamily: "monospace",
    },
    cardTitle: {
        fontFamily: "var(--font-bebas)",
        fontSize: "2.2rem",
        margin: "0 0 15px 0",
        lineHeight: "1",
    },
    cardDesc: {
        color: "#888",
        fontSize: "0.9rem",
        lineHeight: "1.6",
        marginBottom: "25px",
    },
    readMore: {
        color: "#fff",
        fontSize: "0.7rem",
        letterSpacing: "3px",
        fontFamily: "monospace",
        marginTop: "auto",
        border: "1px solid #333",
        padding: "8px 15px",
        width: "fit-content",
    },
    articleImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    loadingText: {
        fontFamily: "monospace",
        color: "#d4ff00",
        fontSize: "1rem",
        letterSpacing: "4px",
        textAlign: "center",
        padding: "100px 0",
    },
    noData: {
        fontFamily: "monospace",
        color: "#444",
        fontSize: "0.8rem",
        letterSpacing: "2px",
        textAlign: "center",
        padding: "100px 0",
    },
};
