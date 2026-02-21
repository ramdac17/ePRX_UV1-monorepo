"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import imageCompression from "browser-image-compression";
export default function WriteArticlePage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    // AUTH GUARD
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login?redirect=/write-article");
            }
            else {
                setCheckingAuth(false);
            }
        }
    }, [user, loading, router]);
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        // Preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        // Compress
        setIsCompressing(true);
        try {
            const options = {
                maxSizeMB: 1, // Increased since we are saving to disk, not DB
                maxWidthOrHeight: 1200,
                useWebWorker: true,
            };
            const compressedFile = await imageCompression(file, options);
            setSelectedFile(compressedFile);
        }
        catch (error) {
            console.error("COMPRESSION_ERROR:", error);
            alert("IMAGE_ERROR: Failed to process image.");
        }
        finally {
            setIsCompressing(false);
        }
    };
    const handleRemoveImage = () => {
        setImagePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current)
            fileInputRef.current.value = "";
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isCompressing) {
            alert("SYSTEM_BUSY: Please wait for image processing.");
            return;
        }
        setIsSubmitting(true);
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
        // 1. Correctly build the FormData object
        const formElement = e.currentTarget;
        const formData = new FormData();
        // Grab values directly from the form names
        formData.append("title", formElement.elements.namedItem("title").value);
        formData.append("category", formElement.elements.namedItem("category").value);
        formData.append("content", formElement.elements.namedItem("content").value);
        formData.append("authorId", user?.id || "");
        // 2. Append the binary file (NOT the base64 string)
        if (selectedFile) {
            formData.append("image", selectedFile);
        }
        try {
            const response = await fetch(`${BACKEND_URL}/article`, {
                method: "POST",
                headers: {
                    // REMOVED "Content-Type": "application/json"
                    // The browser MUST set the Content-Type to "multipart/form-data; boundary=..." automatically
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData, // Send the FormData object directly
            });
            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            }
            catch (err) {
                console.error("NON_JSON_RESPONSE:", responseText);
                throw new Error("SERVER_PROTOCOL_ERROR");
            }
            if (response.ok) {
                router.push("/");
                router.refresh();
            }
            else {
                alert(`PUBLICATION_FAILED: ${responseData.message || "Unknown Error"}`);
            }
        }
        catch (error) {
            console.error("CONNECTION_ERROR:", error);
            alert(`CRITICAL_ERROR: ${error.message}`);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<div style={styles.pageContainer}>
      <h1 style={styles.mainTitle}>
        WRITE <span style={{ color: "#d4ff00" }}>ARTICLE</span>
      </h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={styles.sectionTitle}> // ARTICLE_CORE</h3>
    // ARTICLE_CORE</h3>

        <div style={styles.fieldRow}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>TITLE</label>
            <input name="title" required style={styles.input} placeholder="ENTRY_TITLE..."/>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>CATEGORY</label>
            <select name="category" required style={styles.select}>
              <option value="GEAR">GEAR</option>
              <option value="FUEL">FUEL</option>
              <option value="MIND">MIND</option>
            </select>
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>COVER IMAGE</label>
          <div style={styles.uploadContainer}>
            {!imagePreview ? (<label style={styles.uploadPlaceholder}>
                <span>+ UPLOAD_VISUAL_ASSET</span>
                <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} style={{ display: "none" }}/>
              </label>) : (<div style={styles.previewWrapper}>
                <img src={imagePreview} alt="Preview" style={styles.previewImage}/>
                <button type="button" onClick={handleRemoveImage} style={styles.removeImageBtn}>
                  REMOVE_ASSET
                </button>
                {isCompressing && (<div style={styles.compressionOverlay}>PROCESSING...</div>)}
              </div>)}
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>CONTENT</label>
          <textarea name="content" required style={styles.textarea} placeholder="WRITE_DATA_HERE..."/>
        </div>

        <button type="submit" disabled={isSubmitting || isCompressing} style={{
            ...styles.submitBtn,
            opacity: isSubmitting || isCompressing ? 0.5 : 1,
            cursor: isSubmitting || isCompressing ? "not-allowed" : "pointer",
        }}>
          {isSubmitting ? "SYNCING_TO_DATABASE..." : "PUBLISH TO ARCHIVE"}
        </button>
      </form>
    </div>);
}
const styles = {
    pageContainer: {
        backgroundColor: "#0f0f0f",
        minHeight: "100vh",
        padding: "40px 8%",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    loadingContainer: {
        backgroundColor: "#0f0f0f",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontFamily: "monospace",
        color: "#d4ff00",
        fontSize: "1rem",
        letterSpacing: "4px",
    },
    mainTitle: {
        fontFamily: "var(--font-bebas)",
        fontSize: "3rem",
        marginBottom: "20px",
        textAlign: "center",
    },
    sectionTitle: {
        fontSize: "0.7rem",
        color: "#d4ff00",
        letterSpacing: "3px",
        borderBottom: "1px solid #222",
        paddingBottom: "8px",
        marginTop: "10px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        maxWidth: "800px",
        width: "100%",
    },
    fieldRow: { display: "flex", gap: "15px" },
    fieldGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
    label: { fontSize: "0.55rem", color: "#666", letterSpacing: "1px" },
    input: {
        backgroundColor: "#111",
        border: "1px solid #333",
        padding: "8px",
        color: "#fff",
        outline: "none",
        flex: 1,
        fontSize: "0.85rem",
    },
    select: {
        backgroundColor: "#111",
        border: "1px solid #333",
        padding: "8px",
        color: "#fff",
        outline: "none",
        fontSize: "0.85rem",
        cursor: "pointer",
    },
    textarea: {
        backgroundColor: "#111",
        border: "1px solid #333",
        padding: "8px",
        color: "#fff",
        minHeight: "200px",
        outline: "none",
        fontSize: "0.85rem",
        fontFamily: "inherit",
        resize: "vertical",
    },
    submitBtn: {
        backgroundColor: "#d4ff00",
        color: "#000",
        border: "none",
        padding: "12px",
        fontFamily: "var(--font-bebas)",
        fontSize: "1.1rem",
        marginTop: "10px",
        fontWeight: "bold",
    },
    uploadContainer: {
        width: "100%",
        minHeight: "120px",
        backgroundColor: "#111",
        border: "1px dashed #333",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
    },
    uploadPlaceholder: {
        width: "100%",
        height: "120px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        color: "#666",
        fontSize: "0.7rem",
        fontFamily: "monospace",
        letterSpacing: "2px",
    },
    previewWrapper: {
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
    },
    previewImage: {
        maxWidth: "100%",
        maxHeight: "300px",
        objectFit: "cover",
        border: "1px solid #333",
    },
    removeImageBtn: {
        marginTop: "10px",
        backgroundColor: "#ff3e3e",
        color: "#fff",
        border: "none",
        padding: "5px 10px",
        fontSize: "0.55rem",
        fontFamily: "monospace",
        cursor: "pointer",
        letterSpacing: "1px",
    },
    compressionOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "0.7rem",
        fontFamily: "monospace",
        color: "#d4ff00",
    },
};
