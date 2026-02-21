"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
export default function GearPage() {
    const [article, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchArticles() {
            try {
                const response = await fetch("/api/article?category=GEAR");
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
    }, []);
    return (<div style={styles.pageContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          GEAR <span style={{ color: "#d4ff00" }}>ESSENTIALS</span>
        </h1>
        <p style={styles.subtitle}>CURATED EQUIPMENT FOR THE MODERN RUNNER</p>
      </div>

      <div style={styles.content}>
        {loading ? (<div style={styles.loadingText}>LOADING_DATA_STREAM...</div>) : article.length > 0 ? (<div style={styles.grid}>
            {article.map((article) => (<Link key={article.id} href={`/article/${article.id}`} style={styles.cardLink}>
                <motion.div style={styles.card} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <div style={styles.imageContainer}>
                    {article.image ? (<img src={article.image} alt={article.title} style={styles.articleImage}/>) : (<div style={styles.placeholderImage}>
                        <span style={styles.imageLabel}>NO_VISUAL</span>
                      </div>)}
                  </div>
                  <div style={styles.cardContent}>
                    <span style={styles.tag}>
                      {article.category} //{" "}
             //{" "}
                      {new Date(article.createdAt).getFullYear()}
                    </span>
                    <h2 style={styles.cardTitle}>
                      {article.title.toUpperCase()}
                    </h2>
                    <p style={styles.cardDesc}>
                      {article.content.substring(0, 100)}...
                    </p>
                    <div style={styles.readMore}>READ ANALYSIS →</div>
                  </div>
                </motion.div>
              </Link>))}
          </div>) : (<div style={styles.noData}>NO_EQUIPMENT_DATA_FOUND</div>)}
      </div>
    </div>);
}
const styles = {
    pageContainer: {
        backgroundColor: "#0f0f0f",
        color: "#fff",
        minHeight: "100vh",
        padding: "100px 8% 60px",
    },
    header: {
        marginBottom: "60px",
        borderBottom: "1px solid #333",
        paddingBottom: "40px",
    },
    title: {
        fontFamily: "var(--font-bebas)",
        fontSize: "6rem",
        margin: 0,
        lineHeight: "0.9",
    },
    subtitle: {
        color: "#444",
        letterSpacing: "4px",
        fontSize: "0.9rem",
        marginTop: "10px",
        fontWeight: "bold",
    },
    content: {
        display: "flex",
        flexDirection: "column",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "40px",
    },
    cardLink: {
        textDecoration: "none",
        color: "inherit",
        display: "block",
    },
    card: {
        backgroundColor: "#0a0a0a",
        border: "1px solid #222",
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },
    imageContainer: {
        height: "250px",
        backgroundColor: "#1a1a1a",
        overflow: "hidden",
        position: "relative",
    },
    placeholderImage: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111",
        backgroundImage: "radial-gradient(#222 1px, transparent 1px)", // grid pattern effect
        backgroundSize: "20px 20px",
    },
    imageLabel: {
        color: "#333",
        fontFamily: "var(--font-bebas)",
        fontSize: "2rem",
        letterSpacing: "2px",
    },
    cardContent: {
        padding: "30px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    tag: {
        color: "#666",
        fontSize: "0.6rem",
        letterSpacing: "2px",
        marginBottom: "10px",
        fontWeight: "bold",
    },
    cardTitle: {
        fontFamily: "var(--font-bebas)",
        fontSize: "2.5rem",
        margin: "0 0 15px 0",
        lineHeight: "0.9",
        color: "#fff",
    },
    cardDesc: {
        color: "#888",
        fontSize: "0.85rem",
        lineHeight: "1.6",
        marginBottom: "25px",
    },
    readMore: {
        color: "#d4ff00",
        fontSize: "0.75rem",
        letterSpacing: "2px",
        fontWeight: "bold",
        marginTop: "auto", // pushes to bottom
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
        color: "#666",
        fontSize: "0.8rem",
        letterSpacing: "2px",
        textAlign: "center",
        padding: "100px 0",
    },
};
