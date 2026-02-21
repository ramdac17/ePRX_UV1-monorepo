"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import NavbarDrawer from "./NavbarDrawer";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
// ✅ FIXED: Points to STATIC_URL for images
const STATIC_URL = process.env.NEXT_PUBLIC_STATIC_URL;
export default function Navbar({ onMenuClick }) {
    const { user: authUser, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState(null);
    useEffect(() => {
        setMounted(true);
    }, []);
    const handleSignOut = () => {
        logout();
        setIsMenuOpen(false);
        router.push("/login");
    };
    const navItems = authUser
        ? [
            { name: "DASHBOARD", path: "/dashboard" },
            {
                name: "RUNNERS GUIDE",
                path: "#",
                children: [
                    { name: "GEARS", path: "/gear" },
                    { name: "FUEL", path: "/fuel" },
                    { name: "MIND", path: "/mind" },
                ],
            },
            {
                name: "ARCHIVES",
                path: "#",
                children: [
                    { name: "ARTICLES", path: "/articles" },
                    { name: "STORIES", path: "/stories" },
                ],
            },
            { name: "LIVE EVENTS", path: "/events" },
            { name: "CONTACT", path: "/contactus" },
            { name: "ABOUT US", path: "/aboutus" },
        ]
        : [
            { name: "DASHBOARD", path: "/dashboard" },
            {
                name: "RUNNERS GUIDE",
                path: "#",
                children: [
                    { name: "GEARS", path: "/gear" },
                    { name: "FUEL", path: "/fuel" },
                    { name: "MIND", path: "/mind" },
                ],
            },
            {
                name: "ARCHIVES",
                path: "#",
                children: [
                    { name: "ARTICLES", path: "/articles" },
                    { name: "STORIES", path: "/stories" },
                ],
            },
            { name: "LIVE EVENTS", path: "/events" },
            { name: "ABOUT US", path: "/aboutus" },
            { name: "CONTACT", path: "/contactus" },
            { name: "JOIN US", path: "/register" },
        ];
    if (!mounted)
        return null;
    return (<>
      <NavbarDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onLogout={handleSignOut}/>

      <nav style={styles.navContainer}>
        <div style={styles.leftSection}>
          {authUser && (<motion.div style={styles.hamburger} onClick={() => setIsMenuOpen(true)} whileHover="hover">
              <motion.div variants={{ hover: { width: "24px" } }} style={{ ...styles.line, width: "18px" }}/>
              <motion.div variants={{ hover: { width: "24px" } }} style={{ ...styles.line, width: "24px" }}/>
              <motion.div variants={{ hover: { width: "24px" } }} style={{ ...styles.line, width: "14px" }}/>
            </motion.div>)}
        </div>

        <div style={styles.centerSection}>
          {navItems.map((item) => (<div key={item.name} style={{ position: "relative" }} 
        // Fixed: Individual dropdown tracking
        onMouseEnter={() => item.children && setOpenDropdown(item.name)} onMouseLeave={() => setOpenDropdown(null)}>
              <Link href={item.path} style={{
                ...styles.logo,
                color: 
                // Fixed: Highlighting logic
                (item.path === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.path)) && item.path !== "#"
                    ? "#d4ff00"
                    : "#ffffff",
            }}>
                {item.name} {item.children && "▾"}
              </Link>

              <AnimatePresence>
                {item.children && openDropdown === item.name && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={styles.dropdown}>
                    {item.children.map((child) => (<Link key={child.path} href={child.path} style={styles.dropdownItem}>
                        {child.name}
                      </Link>))}
                  </motion.div>)}
              </AnimatePresence>
            </div>))}
        </div>

        <div style={styles.authSection}>
          {authUser ? (<div style={styles.profileArea}>
              <Link href="/profile" style={styles.avatarLink}>
                <div style={styles.avatarCircle}>
                  {/* ✅ FIXED IMAGE LOGIC */}
                  {authUser.image ? (<img src={`${STATIC_URL}/${authUser.image}?t=${Date.now()}`} alt="User Avatar" style={styles.avatarImg} onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = "none";
                }}/>) : (<span style={styles.avatarInitial}>
                      {authUser.firstName?.[0] || "U"}
                    </span>)}
                </div>
              </Link>
              <button onClick={handleSignOut} style={styles.authBtn}>
                LOG OUT
              </button>
            </div>) : (<Link href="/login" style={styles.authBtn}>
              LOGIN
            </Link>)}
        </div>
      </nav>
    </>);
}
const styles = {
    // ... rest of your styles are perfect ...
    navContainer: {
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2%",
        backgroundColor: "rgba(5, 5, 5, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        boxSizing: "border-box",
        zIndex: 1000,
    },
    leftSection: { flex: 1, display: "flex", alignItems: "center" },
    centerSection: {
        display: "flex",
        gap: "40px",
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        fontFamily: "var(--font-bebas), sans-serif",
        fontSize: "0.8rem",
        fontWeight: "bold",
        letterSpacing: "5px",
        color: "#ffffff",
        textDecoration: "none",
        padding: "10px 0",
    },
    dropdown: {
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#050505",
        border: "1px solid #1a1a1a",
        padding: "10px 0",
        minWidth: "160px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    },
    dropdownItem: {
        padding: "12px 20px",
        color: "#888",
        fontSize: "0.7rem",
        textDecoration: "none",
        letterSpacing: "3px",
        fontFamily: "var(--font-bebas)",
        transition: "all 0.3s ease",
    },
    authSection: {
        flex: 1,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    profileArea: { display: "flex", alignItems: "center", gap: "10px" },
    avatarCircle: {
        width: "35px",
        height: "35px",
        borderRadius: "50%",
        backgroundColor: "#000",
        border: "1.5px solid #d4ff00",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
    avatarInitial: { color: "#d4ff00", fontSize: "0.85rem", fontWeight: "bold" },
    authBtn: {
        fontSize: "0.6rem",
        letterSpacing: "2px",
        color: "#fff",
        background: "transparent",
        border: "1px solid #333",
        padding: "5px 12px",
        cursor: "pointer",
    },
    hamburger: {
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        padding: "10px",
    },
    line: { height: "1.5px", backgroundColor: "#d4ff00" },
};
