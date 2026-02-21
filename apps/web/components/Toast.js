"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
export default function Toast({ message, isVisible, onClose, type = "success", }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);
    return (<AnimatePresence>
      {isVisible && (<motion.div initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }} style={{
                position: "fixed",
                bottom: "40px",
                left: "50%",
                backgroundColor: type === "success" ? "#d4ff00" : "#ff4444",
                color: "#000",
                padding: "12px 24px",
                fontFamily: "monospace",
                fontWeight: "bold",
                letterSpacing: "2px",
                zIndex: 9999,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                fontSize: "0.75rem",
            }}>
          {type === "success" ? ">> " : "!! "} {message.toUpperCase()}
        </motion.div>)}
    </AnimatePresence>);
}
