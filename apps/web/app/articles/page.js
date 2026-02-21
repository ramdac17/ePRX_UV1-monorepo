"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
export default function ArticlesArchivePage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    // ePRX UV1 Connection Logic
    const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const STATIC_URL = BACKEND_API.replace("/api", "");
    useEffect(() => {
        async function fetchArticles() {
            try {
                // Fetching all articles from the pluralized endpoint
                const response = await fetch(`${BACKEND_API}/article`);
                if (response.ok) {
                    const data = await response.json();
                    setArticles(data);
                }
            }
            catch (error) {
                console.error("FETCH_ERROR:", error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchArticles();
    }, [BACKEND_API]);
    return (<div style={styles.pageContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          STATION <span style={{ color: "#d4ff00" }}>ARCHIVES</span>
        </h1>
        <p style={styles.subtitle}>
          CENTRAL REPOSITORY FOR ALL OPERATIONAL DATA AND TRANSMISSIONS
        </p>
      </div>

      <div style={styles.content}>
        {loading ? (<div style={styles.loadingText}>DECRYPTING_ARCHIVE_STREAM...</div>) : articles.length > 0 ? (<div style={styles.grid}>
            {articles.map((item) => (<Link key={item.id} href={`/article/${item.id}`} // Aligned with your dynamic folder
             style={styles.cardLink}>
                <motion.div style={styles.card} whileHover={{ y: -8, borderColor: "#d4ff00" }} transition={{ type: "spring", stiffness: 300 }}>
                  <div style={styles.imageContainer}>
                    {item.image ? (<img src={`${STATIC_URL}/uploads/${item.image}`} alt={item.title} style={styles.articleImage}/>) : (<div style={styles.placeholderImage}>
                        <span style={styles.imageLabel}>NO_VISUAL</span>
                      </div>)}
                  </div>
                  <div style={styles.cardContent}>
                    <span style={styles.tag}>
                      {item.category} //{" "}
             //{" "}
                      {new Date(item.createdAt).getFullYear()}
                    </span>
                    <h2 style={styles.cardTitle}>{item.title.toUpperCase()}</h2>
                    <p style={styles.cardDesc}>
                      {item.content.substring(0, 120)}...
                    </p>
                    <div style={styles.readMore}>ACCESS_DATA →</div>
                  </div>
                </motion.div>
              </Link>))}
          </div>) : (<div style={styles.noData}>NO_ARCHIVED_TRANSMISSIONS_FOUND</div>)}
      </div>
    </div>);
}
const styles = {
    pageContainer: {
        backgroundColor: "#0f0f0f",
        color: "#fff",
        minHeight: "100vh",
        padding: "100px 8% 60px", // Adjusted for fixed navbar
    },
    header: {
        marginBottom: "60px",
        borderBottom: "1px solid #1a1a1a",
        paddingBottom: "40px",
    },
    title: {
        fontFamily: "var(--font-bebas), sans-serif",
        fontSize: "6rem",
        margin: 0,
        lineHeight: "0.9",
        letterSpacing: "-2px",
    },
    subtitle: {
        color: "#666",
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
        transition: "border-color 0.3s ease",
    },
    imageContainer: {
        height: "220px",
        backgroundColor: "#111",
        overflow: "hidden",
        position: "relative",
        borderBottom: "1px solid #1a1a1a",
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
        color: "#fff",
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
        transition: "all 0.3s",
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
