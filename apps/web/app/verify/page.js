"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
const VerifyContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("INITIALIZING_VERIFICATION_PROTOCOL...");
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus("error");
                setMessage("MISSING_TOKEN: ACCESS_DENIED.");
                return;
            }
            try {
                // Points to your @Get('verify') in AuthController
                await api.get(`/auth/verify?token=${token}`);
                setStatus("success");
                setMessage("IDENTITY CONFIRMED. YOU CAN NOW LOGIN TO PRX!");
                // Brief delay so they see the success message
                setTimeout(() => {
                    router.push("/login?verified=true");
                }, 4000);
            }
            catch (error) {
                setStatus("error");
                setMessage(error.response?.data?.message ||
                    "VERIFICATION_FAILED: TOKEN_EXPIRED.");
            }
        };
        verifyToken();
    }, [token, router]);
    return (<div style={styles.container}>
      <div style={{
            ...styles.box,
            borderColor: status === "error" ? "#ff4444" : "#d4ff00",
        }}>
        <h1 style={{
            ...styles.title,
            color: status === "error" ? "#ff4444" : "#d4ff00",
        }}>
          {status === "loading"
            ? "SCANNING..."
            : status === "success"
                ? "VERIFIED"
                : "ERROR"}
        </h1>
        <p style={styles.text}>{message}</p>

        {status === "error" && (<button onClick={() => router.push("/register")} style={styles.btn}>
            RE-REGISTER
          </button>)}
      </div>
    </div>);
};
// Main Page Export with Suspense
export default function VerifyPage() {
    return (<Suspense fallback={<div style={styles.container}>LOADING_ASSETS...</div>}>
      <VerifyContent />
    </Suspense>);
}
const styles = {
    container: {
        height: "100vh",
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        color: "#fff",
    },
    box: {
        padding: "40px",
        border: "1px solid",
        textAlign: "center",
        maxWidth: "400px",
        backgroundColor: "#0a0a0a",
    },
    title: { fontSize: "1.5rem", letterSpacing: "4px", marginBottom: "20px" },
    text: { fontSize: "0.9rem", color: "#888", marginBottom: "20px" },
    btn: {
        backgroundColor: "transparent",
        color: "#ff4444",
        border: "1px solid #ff4444",
        padding: "10px 20px",
        cursor: "pointer",
        fontSize: "0.7rem",
    },
};
