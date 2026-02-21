"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
const STATIC_URL = process.env.NEXT_PUBLIC_STATIC_URL;
export default function NavbarDrawer({ isOpen, onClose, onLogout, }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const guestItems = [
        { name: "LIVE EVENTS", path: "/events" },
        { name: "ARTICLES", path: "/articles" },
        { name: "ABOUT US", path: "/aboutus" },
        { name: "LOGIN", path: "/login" },
    ];
    const authItems = [
        { name: "DASHBOARD", path: "/" },
        { name: "ARTICLES", path: "/articles" },
        { name: "POST EVENT", path: "/post-event" },
        { name: "WRITE ARTICLE", path: "/write-article" },
        { name: "ABOUT US", path: "/aboutus" },
        { name: "CONTACT US", path: "/contacttus" },
    ];
    const menuItems = user ? authItems : guestItems;
    const linkVariants = {
        initial: { x: 0, color: "#fff" },
        hover: { x: 10, color: "#d4ff00" },
    };
    return (<AnimatePresence>
      {isOpen && (<>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={styles.backdrop}/>

          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} style={styles.drawer}>
            <div style={styles.header}>
              <Link href="/profile" onClick={onClose} style={styles.profileLink}>
                <div style={styles.avatarCircle}>
                  {user?.image ? (<img src={`${STATIC_URL}/${user.image}?t=${Date.now()}`} alt="User" style={styles.avatarImg}/>) : (<span style={styles.avatarInitial}>
                      {user?.firstName?.[0] || "G"}
                    </span>)}
                </div>
                <div style={styles.userInfo}>
                  <p style={styles.userName}>
                    {user?.firstName
                ? `${user.firstName} ${user.lastName || ""}`
                : "GUEST_RUNNER"}
                  </p>
                  <p style={styles.viewProfile}>
                    {user ? "VIEW_PROFILE" : "IDENTITY_OFFLINE"}
                  </p>
                </div>
              </Link>
            </div>

            <nav style={styles.navLinks}>
              {menuItems.map((item, index) => {
                const isActive = pathname === item.path;
                // ✅ LOGIC: Add dividers before specific sections
                const showDivider = (item.name === "POST EVENT" && user) ||
                    item.name === "ABOUT US";
                return (<React.Fragment key={index}>
                    {showDivider && <hr style={styles.divider}/>}
                    <motion.div variants={linkVariants} initial="initial" whileHover="hover" animate={isActive ? { color: "#d4ff00" } : { color: "#fff" }}>
                      <Link href={item.path} onClick={onClose} style={styles.link}>
                        {item.name}
                        {isActive && <span style={styles.activeDot}> •</span>}
                      </Link>
                    </motion.div>
                  </React.Fragment>);
            })}

              {user && (<>
                  <hr style={styles.divider}/>
                  <motion.div variants={linkVariants} initial="initial" whileHover={{ x: 10, color: "#ff4444" }} onClick={() => {
                    onLogout();
                    onClose();
                }} style={{ cursor: "pointer" }}>
                    <div style={{ ...styles.link, color: "#ff4444" }}>
                      LOGOUT
                    </div>
                  </motion.div>
                </>)}
            </nav>

            <div style={styles.footer}>
              <div style={styles.socialIcons}>
                <a href="#" style={styles.socialLink}>
                  <Facebook size={16}/>
                </a>
                <a href="#" style={styles.socialLink}>
                  <Twitter size={16}/>
                </a>
                <a href="#" style={styles.socialLink}>
                  <Instagram size={16}/>
                </a>
              </div>
              <p style={styles.version}>EPRX // SYSTEM_ACTIVE</p>
            </div>
          </motion.div>
        </>)}
    </AnimatePresence>);
}
const styles = {
    backdrop: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        zIndex: 2000,
        backdropFilter: "blur(4px)",
    },
    drawer: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "300px",
        height: "100%",
        backgroundColor: "#0a0a0a",
        zIndex: 2001,
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1a1a1a",
    },
    header: {
        marginBottom: "40px",
        paddingBottom: "30px",
        borderBottom: "1px solid #1a1a1a",
    },
    profileLink: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        textDecoration: "none",
    },
    avatarCircle: {
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        border: "1.5px solid #d4ff00",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
        boxShadow: "0 0 15px rgba(212, 255, 0, 0.2)",
    },
    avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
    avatarInitial: { color: "#d4ff00", fontWeight: "bold", fontSize: "1.2rem" },
    userInfo: { display: "flex", flexDirection: "column" },
    userName: {
        color: "#fff",
        fontSize: "0.8rem",
        letterSpacing: "1px",
        margin: 0,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    viewProfile: {
        color: "#d4ff00",
        fontSize: "0.6rem",
        letterSpacing: "2px",
        marginTop: "4px",
    },
    navLinks: { display: "flex", flexDirection: "column", gap: "25px" },
    link: {
        color: "inherit",
        textDecoration: "none",
        fontSize: "0.75rem",
        letterSpacing: "4px",
        display: "block",
    },
    activeDot: { fontSize: "1.2rem", verticalAlign: "middle" },
    // ✅ NEW: Styled Divider
    divider: {
        border: "none",
        height: "1px",
        background: "linear-gradient(90deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%)",
        margin: "5px 0",
        width: "100%",
    },
    footer: {
        marginTop: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    socialIcons: { display: "flex", gap: "20px" },
    socialLink: { color: "#666", transition: "color 0.2s" },
    version: { color: "#333", fontSize: "0.5rem", letterSpacing: "3px" },
};
