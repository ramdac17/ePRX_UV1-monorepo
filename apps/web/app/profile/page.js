"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import imageCompression from "browser-image-compression";
import Toast from "@/components/Toast";
import { AuthGuard } from "@/components/AuthGuard";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STATIC_URL = process.env.NEXT_PUBLIC_STATIC_URL;
export default function ProfilePage() {
    const router = useRouter();
    const { user: authUser, loading: authLoading, login, logout } = useAuth();
    const [user, setUser] = useState({
        id: "",
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        mobile: "",
        password: "",
        image: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState("success");
    useEffect(() => {
        if (!authLoading) {
            if (!authUser) {
                router.push("/login?redirect=/profile");
                return;
            }
            const fetchProfile = async () => {
                try {
                    const response = await axios.get(`${API_URL}/user/profile?id=${authUser.id}`, { headers: { Authorization: `Bearer ${authUser.token}` } });
                    setUser({ ...response.data, id: authUser.id, password: "" });
                    if (response.data.image) {
                        setPreviewUrl(`${STATIC_URL}/${response.data.image}`);
                    }
                }
                catch (err) {
                    console.error("FETCH_ERROR:", err);
                }
                finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [authUser, authLoading, router]);
    const handleExportData = () => {
        const dataStr = "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(user, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `ePRX_UV1_DATA_${user.username}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setToastMsg("DATA_PORTABILITY_EXPORTED");
        setToastType("success");
        setShowToast(true);
    };
    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("CRITICAL_ACTION: This will permanently purge your runner credentials. Proceed?");
        if (!confirmed)
            return;
        try {
            const token = authUser?.token;
            if (!token)
                throw new Error("SESSION_EXPIRED");
            await axios.delete(`${API_URL}/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setToastMsg("ACCOUNT_PURGED_SUCCESSFULLY");
            setToastType("success");
            setShowToast(true);
            setTimeout(() => {
                logout();
                router.push("/");
            }, 2000);
        }
        catch (err) {
            setToastMsg("PURGE_PROTOCOL_FAILED");
            setToastType("error");
            setShowToast(true);
        }
    };
    const handleRequestReset = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/auth/forgot-password`, {
                email: user.email,
            });
            setToastMsg("RECOVERY_LINK_TRANSMITTED");
            setToastType("success");
            setShowToast(true);
        }
        catch (err) {
            setToastMsg("TRANSMISSION_ERROR");
            setToastType("error");
            setShowToast(true);
        }
    };
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (previewUrl?.startsWith("blob:"))
            URL.revokeObjectURL(previewUrl);
        if (!file)
            return;
        const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 800,
            useWebWorker: true,
        };
        try {
            const compressed = await imageCompression(file, options);
            setSelectedFile(compressed);
            setPreviewUrl(URL.createObjectURL(compressed));
        }
        catch (error) {
            setToastMsg("IMAGE_OPTIMIZATION_FAILED");
            setShowToast(true);
        }
    };
    const handleUpdate = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("firstName", user.firstName || "");
            formData.append("lastName", user.lastName || "");
            formData.append("username", user.username || "");
            formData.append("mobile", user.mobile || "");
            if (user.password)
                formData.append("password", user.password);
            if (selectedFile)
                formData.append("image", selectedFile);
            const response = await axios.post(`${API_URL}/user/${user.id}/upload-image`, formData);
            const updatedUser = {
                ...authUser,
                ...user,
                image: response.data.image || user.image,
            };
            if (authUser?.token)
                login(updatedUser, authUser.token);
            setToastMsg("PROFILE_SYNC_SUCCESSFUL");
            setToastType("success");
            setShowToast(true);
        }
        catch (err) {
            setToastMsg(err.response?.data?.message || "SYNC_FAILED");
            setToastType("error");
            setShowToast(true);
        }
        finally {
            setSaving(false);
        }
    };
    if (authLoading || loading)
        return <div style={styles.loader}>INITIALIZING_PROFILE_INTEL...</div>;
    return (<AuthGuard>
      <div style={styles.container}>
        <div style={styles.titleContainer}>
          <h1 style={styles.title}>
            USER <span style={{ color: "#d4ff00" }}>PROFILE</span>
          </h1>
          <p style={styles.subtitle}>
            MANAGE YOUR RUNNER CREDENTIALS & PRIVACY
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.imageSection}>
            <div style={styles.avatarCircle}>
              {previewUrl ? (<img src={previewUrl} alt="Profile" style={styles.preview}/>) : (<div style={styles.placeholder}>
                  {user.firstName?.[0] || "U"}
                </div>)}
            </div>
            <label style={styles.uploadBtn}>
              {selectedFile ? "IMAGE_READY" : "CHANGE_IMAGE"}
              <input type="file" hidden accept="image/*" onChange={handleImageChange}/>
            </label>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>USER NAME</label>
            <input style={styles.input} value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })}/>
          </div>

          <div style={styles.grid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>FIRST NAME</label>
              <input style={styles.input} value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })}/>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>LAST NAME</label>
              <input style={styles.input} value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })}/>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>EMAIL (PERMANENT ID)</label>
            <input value={user.email} disabled style={{ ...styles.input, color: "#444", cursor: "not-allowed" }}/>
          </div>

          <button onClick={handleUpdate} style={{ ...styles.saveBtn, opacity: saving ? 0.5 : 1 }} disabled={saving}>
            {saving ? "SYNCING_DATA..." : "UPDATE_PROFILE →"}
          </button>

          {/* Grouped Data Management & Security Protocol */}
          <div style={styles.gdprSection}>
            <h3 style={styles.gdprTitle}>|| SYSTEM_SECURITY_PROTOCOLS</h3>

            <div style={styles.protocolBox}>
              <div style={styles.protocolInfo}>
                <p style={styles.protocolLabel}>CREDENTIAL_RECOVERY</p>
                <p style={styles.protocolDesc}>
                  Trigger a secure password reset handshake via email.
                </p>
              </div>
              <button onClick={handleRequestReset} style={styles.protocolBtn}>
                REQUEST_LINK
              </button>
            </div>

            <div style={styles.gdprGrid}>
              <button onClick={handleExportData} style={styles.gdprBtn}>
                EXPORT_DATA_JSON
              </button>
              <button onClick={handleDeleteAccount} style={styles.deleteBtn}>
                PURGE_ACCOUNT
              </button>
            </div>
          </div>

          <button onClick={() => router.push("/")} style={styles.backBtn}>
            BACK_TO_DASHBOARD
          </button>
        </div>

        <Toast message={toastMsg} isVisible={showToast} onClose={() => setShowToast(false)} type={toastType}/>
      </div>
    </AuthGuard>);
}
const styles = {
    container: {
        backgroundColor: "#0f0f0f",
        minHeight: "100vh",
        padding: "120px 20px 40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    titleContainer: { textAlign: "center", marginBottom: "30px" },
    card: {
        width: "100%",
        maxWidth: "450px",
        backgroundColor: "#111",
        padding: "30px",
        border: "1px solid #1a1a1a",
    },
    title: {
        fontFamily: "var(--font-bebas)",
        fontSize: "3.5rem",
        letterSpacing: "4px",
        margin: 0,
        color: "#fff",
    },
    subtitle: { fontSize: "0.65rem", color: "#444", letterSpacing: "3px" },
    imageSection: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "25px",
    },
    avatarCircle: {
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid #1a1a1a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    preview: { width: "100%", height: "100%", objectFit: "cover" },
    placeholder: { fontSize: "2.5rem", color: "#d4ff00" },
    uploadBtn: {
        fontSize: "0.6rem",
        color: "#d4ff00",
        cursor: "pointer",
        border: "1px solid #d4ff00",
        padding: "6px 14px",
        marginTop: "10px",
    },
    grid: { display: "flex", gap: "20px" },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        marginBottom: "20px",
        width: "100%",
    },
    label: {
        fontSize: "0.6rem",
        color: "#444",
        letterSpacing: "2px",
        marginBottom: "5px",
    },
    input: {
        backgroundColor: "transparent",
        border: "none",
        borderBottom: "1px solid #222",
        color: "#fff",
        padding: "10px 0",
        outline: "none",
        width: "100%",
    },
    saveBtn: {
        backgroundColor: "#d4ff00",
        padding: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        letterSpacing: "3px",
        width: "100%",
        border: "none",
        marginBottom: "10px",
    },
    // Protocol Styles
    gdprSection: {
        marginTop: "30px",
        borderTop: "1px solid #1a1a1a",
        paddingTop: "20px",
    },
    gdprTitle: {
        fontSize: "0.65rem",
        color: "#d4ff00",
        letterSpacing: "2px",
        marginBottom: "15px",
        fontWeight: "bold",
    },
    protocolBox: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px",
        border: "1px solid #1a1a1a",
        marginBottom: "15px",
    },
    protocolInfo: { flex: 1 },
    protocolLabel: { color: "#fff", fontSize: "0.75rem", margin: 0 },
    protocolDesc: { color: "#555", fontSize: "0.6rem", margin: "2px 0 0 0" },
    protocolBtn: {
        backgroundColor: "transparent",
        border: "1px solid #d4ff00",
        color: "#d4ff00",
        fontSize: "0.6rem",
        padding: "8px 12px",
        cursor: "pointer",
    },
    gdprGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
    gdprBtn: {
        backgroundColor: "transparent",
        border: "1px solid #333",
        color: "#888",
        fontSize: "0.6rem",
        padding: "10px",
        cursor: "pointer",
    },
    deleteBtn: {
        backgroundColor: "transparent",
        border: "1px solid #ff3e3e",
        color: "#ff3e3e",
        fontSize: "0.6rem",
        padding: "10px",
        cursor: "pointer",
    },
    backBtn: {
        width: "100%",
        backgroundColor: "transparent",
        color: "#444",
        border: "none",
        marginTop: "20px",
        fontSize: "0.7rem",
        cursor: "pointer",
    },
    loader: {
        color: "#d4ff00",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f0f0f",
    },
};
