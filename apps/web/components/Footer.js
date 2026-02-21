"use client";
import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
export default function Footer() {
    return (<footer style={styles.footer}>
      <div style={styles.container}>
        {/* Left: Branding */}
        <div style={styles.brandSection}>
          <span style={styles.brand}>ePRX</span>
          <span style={styles.copyright}>© 2026 // ALL_RIGHTS_RESERVED</span>
        </div>

        {/* Center: Navigation Links */}
        <div style={styles.linkSection}>
          <Link href="/aboutus" style={styles.link}>
            ABOUT_US
          </Link>
          <Link href="/contactus" style={styles.link}>
            CONTACT_US
          </Link>

          <Link href="/privacy" style={styles.link}>
            PRIVACY_PROTOCOL
          </Link>
        </div>

        {/* Social Media Icons */}
        <div style={styles.socialSection}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            <Facebook size={18}/>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            <Twitter size={18}/>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            <Instagram size={18}/>
          </a>
        </div>

        {/* Right: System Status */}
        <div style={styles.statusSection}>
          <div style={styles.statusGroup}>
            <span style={styles.statusLabel}>LATENCY</span>
            <span style={styles.statusValue}>12MS</span>
          </div>
          <div style={styles.statusGroup}>
            <span style={styles.statusLabel}>ENCRYPTION</span>
            <span style={styles.statusValue}>AES_256</span>
          </div>
        </div>
      </div>
    </footer>);
}
const styles = {
    footer: {
        width: "100%",
        backgroundColor: "#050505",
        borderTop: "1px solid #1a1a1a",
        padding: "40px 60px",
        marginTop: "auto", // Pushes footer to bottom in flex containers
    },
    container: {
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "30px",
    },
    brandSection: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },
    brand: {
        color: "#d4ff00",
        fontSize: "0.8rem",
        letterSpacing: "4px",
        fontWeight: "bold",
    },
    copyright: {
        color: "#444",
        fontSize: "0.5rem",
        letterSpacing: "2px",
    },
    linkSection: {
        display: "flex",
        gap: "40px",
    },
    link: {
        color: "#888",
        textDecoration: "none",
        fontSize: "0.65rem",
        letterSpacing: "2px",
        transition: "color 0.2s ease",
    },
    socialSection: {
        display: "flex",
        gap: "20px",
        alignItems: "center",
    },
    socialLink: {
        color: "#888",
        transition: "color 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    statusSection: {
        display: "flex",
        gap: "30px",
    },
    statusGroup: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
    },
    statusLabel: {
        fontSize: "0.45rem",
        color: "#333",
        letterSpacing: "2px",
    },
    statusValue: {
        fontSize: "0.6rem",
        color: "#666",
        letterSpacing: "1px",
    },
};
