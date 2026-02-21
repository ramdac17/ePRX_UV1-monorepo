"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import NavbarDrawer from "@/components/NavbarDrawer";
// ✅ Import Recharts components
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, } from "recharts";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STATIC_URL = process.env.NEXT_PUBLIC_STATIC_URL;
// ✅ Performance Mock Data
const MOCK_PROGRESS_DATA = [
    { day: "01", distance: 5 },
    { day: "05", distance: 8 },
    { day: "10", distance: 12 },
    { day: "15", distance: 7 },
    { day: "20", distance: 15 },
    { day: "25", distance: 10 },
    { day: "30", distance: 21 },
];
export default function Home() {
    const { logout, user } = useAuth();
    const [scrollY, setScrollY] = useState(0);
    const [hoveredArticle, setHoveredArticle] = useState(null);
    const [isGlitching, setIsGlitching] = useState(false);
    const [isDataHovered, setIsDataHovered] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // Intersection Observer States
    const [isPillarVisible, setPillarVisible] = useState(false);
    const [isMobileVisible, setMobileVisible] = useState(false);
    const [isArchiveVisible, setArchiveVisible] = useState(false);
    const pillarRef = useRef(null);
    const mobileRef = useRef(null);
    const archiveRef = useRef(null);
    // ✅ Auto-generate current timestamp for tactical feel
    const lastUpdated = useMemo(() => {
        return new Date()
            .toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        })
            .toUpperCase();
    }, []);
    const getImageUrl = (imagePath) => {
        if (!imagePath)
            return null;
        if (imagePath.startsWith("http"))
            return imagePath;
        return `${STATIC_URL}/${imagePath}`;
    };
    const pillarData = [
        {
            name: "GEAR",
            path: "/gear",
            img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070",
        },
        {
            name: "FUEL",
            path: "/fuel",
            img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070",
        },
        {
            name: "MIND",
            path: "/mind",
            img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070",
        },
    ];
    const triggerGlitch = () => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 750);
    };
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.target === pillarRef.current && entry.isIntersecting)
                    setPillarVisible(true);
                if (entry.target === mobileRef.current && entry.isIntersecting)
                    setMobileVisible(true);
                if (entry.target === archiveRef.current && entry.isIntersecting)
                    setArchiveVisible(true);
            });
        }, { threshold: 0.2 });
        if (pillarRef.current)
            observer.observe(pillarRef.current);
        if (mobileRef.current)
            observer.observe(mobileRef.current);
        if (archiveRef.current)
            observer.observe(archiveRef.current);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            observer.disconnect();
        };
    }, []);
    const [article, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(true);
    useEffect(() => {
        async function fetchLatestArticles() {
            try {
                const response = await fetch(`${API_URL}/article`);
                if (response.ok) {
                    const data = await response.json();
                    setArticles(data.slice(0, 3));
                }
            }
            catch (error) {
                console.error("FETCH_ARTICLES_ERROR:", error);
            }
            finally {
                setLoadingArticles(false);
            }
        }
        fetchLatestArticles();
    }, []);
    return (<div style={styles.pageContainer}>
      <NavbarDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onLogout={logout}/>
      <Navbar onMenuClick={() => setIsDrawerOpen(true)}/>

      {/* 1. Split Hero Section */}
      <motion.section onViewportEnter={triggerGlitch} style={{
            ...styles.heroSplit,
            backgroundPositionY: `${scrollY * 0.5}px`,
        }}>
        <div style={styles.heroLeft}>
          <div style={styles.brandContent}>
            <div style={styles.topHeroLogo} className="logo-glow">
              <img src="/ePRE1.png" alt="ePRX UV1" style={styles.logoImageStyle}/>
            </div>
            <h1 style={styles.heroTitleLeft} className={isGlitching ? "glitch-active" : ""}>
              PINOY RUNNER <span style={{ color: "#d4ff00" }}>EXTREME</span>
            </h1>
            <h2 style={styles.heroTagline}>
              BEYOND THE <span style={{ color: "#d4ff00" }}>MILE</span>
            </h2>
            <p style={styles.heroSubtitleLeft}>
              A high-performance lifestyle brand curated for those who find
              freedom in running.
            </p>
            <div style={styles.heroActionContainerLeft}>
              <Link href="/login">
                <button style={styles.ctaBtn}>INITIALIZE_SESSION</button>
              </Link>
            </div>
          </div>
        </div>

        {/* ✅ HERO RIGHT - Performance Graph */}
        <div style={styles.heroRight}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onMouseEnter={() => setIsDataHovered(true)} onMouseLeave={() => setIsDataHovered(false)} style={styles.dataContainer}>
            <div style={styles.dataHeader}>
              <span style={styles.dataTitle}>SYSTEM_PERFORMANCE_LOG</span>
              <div style={styles.liveIndicator}>
                <div style={styles.pulseDot}></div>
                <span style={styles.dataStatus}>
                  {user ? "LIVE_FEED" : "OFFLINE"}
                </span>
              </div>
            </div>

            <div style={styles.chartBox}>
              {user ? (<ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_PROGRESS_DATA}>
                    <defs>
                      <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4ff00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d4ff00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false}/>
                    <XAxis dataKey="day" stroke="#444" fontSize={10} tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{
                backgroundColor: "#000",
                border: "1px solid #d4ff00",
                fontSize: "10px",
                borderRadius: "0",
            }} itemStyle={{ color: "#d4ff00" }}/>
                    <Area type="stepAfter" dataKey="distance" stroke="#d4ff00" fillOpacity={1} fill="url(#colorDist)" strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>) : (<div style={styles.lockedChartOverlay}>
                  <span style={styles.lockedText}>ACCESS_DENIED</span>
                  <p style={styles.lockedSubText}>
                    INITIALIZE_SESSION_TO_VIEW_METRICS
                  </p>
                  <p style={styles.miniCta}>
                    Please login to view your activity stats
                  </p>
                </div>)}
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricItem}>
                <span style={styles.metricLabel}>AVG_PACE</span>
                <span style={{
            ...styles.metricValue,
            color: !user ? "#222" : isDataHovered ? "#d4ff00" : "#fff",
        }}>
                  {user ? "5.45" : "0.00"}
                </span>
              </div>
              <div style={styles.metricItem}>
                <span style={styles.metricLabel}>TOTAL_KM</span>
                <span style={{
            ...styles.metricValue,
            color: !user ? "#222" : isDataHovered ? "#d4ff00" : "#fff",
        }}>
                  {user ? "124.8" : "0.0"}
                </span>
              </div>
              <div style={styles.metricItem}>
                <span style={styles.metricLabel}>UPDATED</span>
                <span style={{ ...styles.timestampValue, opacity: user ? 1 : 0.2 }}>
                  {user ? lastUpdated : "XX-XX-XXXX"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. Pillars Section */}
      <section style={styles.pillarSection} ref={pillarRef}>
        <div className={`reveal ${isPillarVisible ? "active" : ""}`}>
          <div style={styles.titleContainer}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionNum}> // THE PILLARS</span>
     // THE PILLARS</span>
              RUNNERS <span style={{ color: "#d4ff00" }}> GUIDE</span>
            </h2>
          </div>
          <div style={styles.pillarGrid}>
            {pillarData.map((item, i) => (<div key={i} style={styles.pillarCard} className="pillar-card">
                <Link href={item.path} style={styles.pillarLink}>
                  <div className="pillar-image" style={{
                ...styles.pillarImageOverlay,
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${item.img})`,
            }}/>
                  <div style={styles.pillarContent}>
                    <span style={styles.cardNum}>0{i + 1}</span>
                    <h3 style={styles.cardTitle}>{item.name}</h3>
                  </div>
                </Link>
              </div>))}
          </div>
        </div>
      </section>

      {/* 3. Mobile Feature Section */}
      <section style={styles.mobileSection} ref={mobileRef}>
        <div className={`reveal ${isMobileVisible ? "active" : ""}`} style={styles.mobileGrid}>
          <div style={styles.mobileTextSide}>
            <h2 style={styles.mobileTitle}>
              MOBILE <span style={{ color: "#d4ff00" }}>ECOSYSTEM</span>
            </h2>
            <p style={styles.mobileDesc}>
              The digital extension of your performance. Track real-time
              biometrics.
            </p>
            <div style={styles.downloadZone}>
              <div style={styles.inlineBadgeContainer}>
                <span style={styles.badgeLabel}>MOBILE PLATFORMS</span>
                <div style={styles.badgeWrapperRow}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="iOS" style={styles.badgeImg}/>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Android" style={styles.badgeImg}/>
                </div>
              </div>
              <div style={styles.qrContainer}>
                <div style={styles.qrFrame}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eprx-v3.com&bgcolor=0f0f0f&color=d4ff00`} alt="Scan" style={styles.qrImage}/>
                </div>
                <span style={styles.qrLabel}>SCAN TO DOWNLOAD</span>
              </div>
            </div>
          </div>
          <div style={styles.mobileVisualSide}>
            <div style={styles.phoneMockup}>
              <div style={styles.phoneScreen}>
                <div style={styles.appMetric}>
                  14.2 <span style={{ fontSize: "1rem" }}>KM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Articles Archive Section */}
      <section style={styles.archiveSection} ref={archiveRef}>
        <header className={`reveal ${isArchiveVisible ? "active" : ""}`} style={styles.archiveHeader}>
          <h2 style={styles.archiveTitle}>
            <span style={styles.sectionNum}> // KNOWLEDGE BASE</span>
     // KNOWLEDGE BASE</span>
            THE <span style={{ color: "#d4ff00" }}>ARCHIVE</span>
          </h2>
        </header>
        <div style={styles.articleGrid}>
          {!loadingArticles &&
            article.map((post) => (<Link key={post.id} href={`/article/${post.id}`} style={{
                    ...styles.articleCard,
                    textDecoration: "none",
                    color: "inherit",
                }} onMouseEnter={() => setHoveredArticle(post.id)} onMouseLeave={() => setHoveredArticle(null)}>
                <div style={styles.imageWrapper}>
                  <img src={getImageUrl(post.image) || ""} alt={post.title} style={{
                    ...styles.articleImg,
                    filter: hoveredArticle === post.id
                        ? "grayscale(0%)"
                        : "grayscale(100%) brightness(50%)",
                    transform: hoveredArticle === post.id ? "scale(1.1)" : "scale(1)",
                }}/>
                </div>
                <div style={styles.articleContent}>
                  <span style={styles.volTag}>
                    {post.category} // {new Date(post.createdAt).getFullYear()}
             // {new Date(post.createdAt).getFullYear()}
                  </span>
                  <h3 style={styles.articleTitle}>
                    {post.title.toUpperCase()}
                  </h3>
                  <div style={styles.readLink}>READ ENTRY →</div>
                </div>
              </Link>))}
        </div>
      </section>
    </div>);
}
const styles = {
    pageContainer: {
        backgroundColor: "#0f0f0f",
        color: "#fff",
        minHeight: "100vh",
        overflowX: "hidden",
        width: "100%",
    },
    heroSplit: {
        minHeight: "100vh",
        display: "flex",
        width: "100%",
        paddingTop: "80px",
        backgroundImage: 'linear-gradient(to right, rgba(15,15,15,1) 35%, rgba(15,15,15,0.2) 100%), url("https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070")',
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        boxSizing: "border-box",
    },
    heroLeft: {
        flex: 1.2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: "8%",
        zIndex: 2,
    },
    heroRight: {
        flex: 0.8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingRight: "8%",
        zIndex: 2,
    },
    // ✅ DATA VISUALIZATION STYLES
    dataContainer: {
        width: "100%",
        maxWidth: "450px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        border: "1px solid #1a1a1a",
        padding: "30px",
        backdropFilter: "blur(10px)",
    },
    dataHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
        borderBottom: "1px solid #1a1a1a",
        paddingBottom: "10px",
    },
    dataTitle: {
        fontSize: "0.6rem",
        letterSpacing: "2px",
        color: "#444",
        fontWeight: "bold",
    },
    liveIndicator: { display: "flex", alignItems: "center", gap: "8px" },
    pulseDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: "#d4ff00",
        boxShadow: "0 0 8px #d4ff00",
    },
    dataStatus: { fontSize: "0.55rem", color: "#d4ff00", letterSpacing: "1px" },
    chartBox: { height: "180px", width: "100%", marginBottom: "25px" },
    metricRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1.2fr",
        gap: "10px",
    },
    metricItem: { display: "flex", flexDirection: "column" },
    metricLabel: {
        fontSize: "0.5rem",
        color: "#666",
        letterSpacing: "1px",
        marginBottom: "5px",
    },
    metricValue: {
        fontFamily: "var(--font-bebas)",
        fontSize: "1.8rem",
        transition: "color 0.3s ease",
    },
    timestampValue: {
        fontFamily: "monospace",
        fontSize: "0.9rem",
        color: "#d4ff00",
        marginTop: "8px",
    },
    // (Rest of the original styles)
    brandContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
    },
    topHeroLogo: {
        width: "100px",
        height: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "40px",
        border: "2px solid #d4ff00",
        borderRadius: "50%",
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    logoImageStyle: { width: "70%", height: "70%", objectFit: "contain" },
    heroTitleLeft: {
        fontFamily: "var(--font-bebas)",
        fontSize: "6vw",
        lineHeight: "0.85",
        margin: "0",
        color: "#fff",
        letterSpacing: "-3px",
    },
    heroTagline: {
        fontFamily: "var(--font-bebas)",
        fontSize: "2rem",
        letterSpacing: "8px",
        margin: "10px 0 20px 0",
    },
    heroSubtitleLeft: {
        color: "#ccc",
        maxWidth: "450px",
        fontSize: "0.8rem",
        lineHeight: "1.6",
        letterSpacing: "1px",
        marginBottom: "30px",
    },
    heroActionContainerLeft: { marginTop: "10px" },
    ctaBtn: {
        padding: "18px 50px",
        border: "2px solid #fff",
        background: "none",
        color: "#fff",
        cursor: "pointer",
        letterSpacing: "3px",
        fontWeight: "bold",
        fontSize: "0.8rem",
        transition: "0.3s",
    },
    pillarSection: { padding: "100px 8%" },
    titleContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        marginBottom: "40px",
    },
    sectionTitle: {
        fontFamily: "var(--font-bebas)",
        fontSize: "3rem",
        textTransform: "uppercase",
    },
    pillarGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "30px",
    },
    pillarCard: {
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#0a0a0a",
        border: "1px solid #1a1a1a",
    },
    pillarLink: { textDecoration: "none", color: "inherit" },
    pillarImageOverlay: {
        height: "250px",
        width: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "transform 0.6s ease, filter 0.6s ease",
        filter: "grayscale(100%)",
    },
    pillarContent: { padding: "20px" },
    cardNum: { color: "#d4ff00", fontSize: "0.8rem", marginBottom: "10px" },
    cardTitle: { fontFamily: "var(--font-bebas)", fontSize: "2.5rem", margin: 0 },
    mobileSection: { padding: "100px 8%", backgroundColor: "#0a0a0a" },
    mobileGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        alignItems: "start",
    },
    mobileTitle: { fontFamily: "var(--font-bebas)", fontSize: "3rem" },
    mobileDesc: { color: "#666", marginTop: "20px", fontSize: "0.9rem" },
    downloadZone: {
        display: "flex",
        alignItems: "flex-end",
        gap: "30px",
        marginTop: "50px",
    },
    inlineBadgeContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    badgeWrapperRow: { display: "flex", flexDirection: "column", gap: "10px" },
    badgeLabel: {
        fontSize: "0.55rem",
        letterSpacing: "4px",
        color: "#666",
        fontWeight: "700",
    },
    badgeImg: { width: "130px", height: "auto" },
    qrContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },
    qrFrame: {
        padding: "8px",
        border: "1px solid #d4ff00",
        borderRadius: "4px",
        backgroundColor: "#000",
    },
    qrImage: { width: "80px", height: "80px" },
    qrLabel: {
        fontSize: "0.5rem",
        letterSpacing: "2px",
        color: "#d4ff00",
        fontWeight: "bold",
    },
    phoneMockup: {
        width: "260px",
        height: "520px",
        border: "8px solid #1a1a1a",
        borderRadius: "40px",
        backgroundColor: "#000",
        padding: "10px",
    },
    phoneScreen: {
        height: "100%",
        backgroundColor: "#0f0f0f",
        borderRadius: "30px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    appMetric: {
        fontFamily: "var(--font-bebas)",
        fontSize: "4rem",
        color: "#d4ff00",
    },
    archiveSection: { padding: "120px 8%" },
    archiveHeader: { textAlign: "center", marginBottom: "40px" },
    sectionNum: {
        color: "#444",
        fontSize: "0.7rem",
        letterSpacing: "3px",
        display: "block",
        textAlign: "center",
    },
    archiveTitle: { fontFamily: "var(--font-bebas)", fontSize: "3rem" },
    articleGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "30px",
    },
    articleCard: {
        backgroundColor: "#0a0a0a",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #1a1a1a",
    },
    imageWrapper: { height: "250px", overflow: "hidden" },
    articleImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "all 0.6s ease",
    },
    articleContent: { padding: "20px" },
    volTag: { color: "#d4ff00", fontSize: "0.7rem", letterSpacing: "2px" },
    articleTitle: {
        fontFamily: "var(--font-bebas)",
        fontSize: "2rem",
        margin: "10px 0",
    },
    readLink: { color: "#fff", fontSize: "0.8rem", fontWeight: "bold" },
    lockedChartOverlay: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(10, 10, 10, 0.5)",
        border: "1px dashed #333",
        gap: "5px",
    },
    lockedText: {
        fontFamily: "var(--font-bebas)",
        fontSize: "1.5rem",
        color: "#444",
        letterSpacing: "4px",
    },
    lockedSubText: {
        fontSize: "0.5rem",
        color: "#666",
        letterSpacing: "1px",
        textAlign: "center",
    },
    miniCta: {
        padding: "8px 20px",
        border: "1px solid #d4ff00",
        background: "none",
        color: "#d4ff00",
        fontSize: "0.6rem",
        letterSpacing: "2px",
        fontWeight: "bold",
    },
};
