"use client";
import React from "react";
import { motion } from "framer-motion";
export default function AboutPage() {
    const sections = [
        {
            id: "01",
            title: "THE_MISSION",
            content: "ePRX V3 IS ENGINEERED TO BRIDGE THE GAP BETWEEN ARCHAIZED DATA SYSTEMS AND THE FUTURE OF SECURE DIGITAL INTERACTION. OUR GOAL IS ABSOLUTE CONNECTIVITY WITHOUT COMPROMISE.",
        },
        {
            id: "02",
            title: "THE_TECH",
            content: "BUILT ON A FOUNDATION OF NEXT-GEN REACT ARCHITECTURE AND POSTGRESQL CORE, OUR SYSTEM ENSURES SUB-MILLISECOND LATENCY AND ENCRYPTED PROFILE INTEGRITY.",
        },
        {
            id: "03",
            title: "THE_VISION",
            content: "WE ARE NOT JUST BUILDING A PLATFORM; WE ARE ARCHITECTING AN ECOSYSTEM FOR OPERATORS WHO DEMAND EFFICIENCY, SPEED, AND MINIMALIST PRECISION.",
        },
    ];
    return (<div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Brand Logo Section */}
        <div style={styles.logoContainer} className="logo-glow">
          <img src="/ePRE1.png" alt="PRX Logo" style={styles.brandLogo}/>
        </div>

        {/* Header Section */}
        <header style={styles.header}>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.version}>
            CORE SYSTEM || PINOY RUNNER EXTREME || EST 2013
          </motion.span>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={styles.mainTitle}>
            ABOUT <span style={{ color: "#d4ff00" }}>PRX</span>
          </motion.h1>
        </header>

        {/* Content Grid */}
        <div style={styles.grid}>
          {sections.map((section, i) => (<motion.div key={section.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} style={styles.card}>
              <span style={styles.cardNumber}>{section.id}</span>
              <h3 style={styles.cardTitle}>{section.title}</h3>
              <p style={styles.cardText}>{section.content}</p>
            </motion.div>))}
        </div>

        {/* Tactical Specs Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={styles.specBox}>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>UPTIME</span>
            <span style={styles.specValue}>99.99%</span>
          </div>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>PROTOCOL</span>
            <span style={styles.specValue}>HTTPS/SECURE</span>
          </div>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>LOCATION</span>
            <span style={styles.specValue}>DISTRIBUTED_NODE</span>
          </div>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>STATUS</span>
            {/* I combined the styles into one object below */}
            <span style={{ ...styles.specValue, color: "#d4ff00" }}>
              OPERATIONAL
            </span>
          </div>
        </motion.div>
      </div>
    </div>);
}
const styles = {
    container: {
        backgroundColor: "#0a0a0a",
        minHeight: "100vh",
        padding: "40px 8%",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
    },
    wrapper: {
        maxWidth: "1200px",
        width: "100%",
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
    header: {
        marginBottom: "80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        borderBottom: "1px solid #1a1a1a",
        paddingBottom: "40px",
    },
    version: {
        fontSize: "0.7rem",
        color: "#444",
        letterSpacing: "4px",
        display: "block",
        marginBottom: "15px",
        fontWeight: "bold",
    },
    mainTitle: {
        fontFamily: "var(--font-bebas)",
        fontSize: "4.5rem",
        margin: 0,
        letterSpacing: "4px",
        textTransform: "uppercase",
        lineHeight: "0.9",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "30px",
        marginBottom: "100px",
    },
    card: {
        backgroundColor: "#0f0f0f",
        padding: "40px",
        border: "1px solid #1a1a1a",
        position: "relative",
        overflow: "hidden",
    },
    cardNumber: {
        fontSize: "0.7rem",
        color: "#333",
        fontWeight: "bold",
        letterSpacing: "2px",
        position: "absolute",
        top: "20px",
        right: "20px",
    },
    cardTitle: {
        fontSize: "0.8rem",
        letterSpacing: "4px",
        color: "#d4ff00",
        marginBottom: "25px",
    },
    cardText: {
        fontSize: "0.9rem",
        lineHeight: "1.8",
        color: "#888",
        letterSpacing: "1px",
    },
    specBox: {
        display: "flex",
        justifyContent: "space-between",
        borderTop: "1px solid #1a1a1a",
        paddingTop: "40px",
        flexWrap: "wrap",
        gap: "20px",
    },
    specItem: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },
    specLabel: {
        fontSize: "0.5rem",
        color: "#444",
        letterSpacing: "3px",
    },
    specValue: {
        fontSize: "0.75rem",
        letterSpacing: "2px",
        fontWeight: "bold",
    },
};
