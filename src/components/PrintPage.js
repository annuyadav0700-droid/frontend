import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import colors from "../theme/colors";

import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function PrintPage({ setPage }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [pages, setPages] = useState(0);

  const [copies, setCopies] = useState(1);
  const [printSide, setPrintSide] = useState("single");
  const [printType, setPrintType] = useState("bw");

  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [code, setCode] = useState("");

  const selectedKiosk = JSON.parse(localStorage.getItem("selectedKiosk"));

  const pricePerPage = printType === "color" ? 10 : 5;
  const effectivePages =
    printSide === "double" ? Math.ceil(pages / 2) : pages;

  const totalAmount = effectivePages * copies * pricePerPage;

  // 🔢 ORDER CODE GENERATOR (fallback)
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 📂 FILE UPLOAD + PREVIEW
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    let totalPages = 0;
    let previewArr = [];

    for (let file of selectedFiles) {
      if (file.type === "application/pdf") {
        try {
          const buffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

          totalPages += pdf.numPages;

          // Cap the visual preview to max 10 pages to prevent memory crash/locking!
          const maxPreviews = Math.min(pdf.numPages, 10);

          for (let i = 1; i <= maxPreviews; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.8 }); // Further reduced for safety

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            // Compress to JPEG for much lower memory footprint than PNG
            previewArr.push(canvas.toDataURL("image/jpeg", 0.7));
            
            // Clean up memory
            canvas.width = 0;
            canvas.height = 0;
          }
        } catch (pdfError) {
          console.error("PDF Parsing Error:", pdfError);
          totalPages += 1;
          previewArr.push("https://static.vecteezy.com/system/resources/previews/023/234/824/non_2x/pdf-icon-red-and-white-color-for-free-png.png");
        }
      } else {
        totalPages += 1;
        previewArr.push(URL.createObjectURL(file));
      }
    }

    setPages(totalPages);
    setPreviews(previewArr);
  };

  // 💳 PAYMENT FLOW
  const handlePayment = async () => {
    if (!selectedKiosk) {
      alert("Please select kiosk first");
      return;
    }

    if (files.length === 0) {
      alert("Upload file first");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay not loaded");
      return;
    }

    try {
      setLoading(true);

      // 📤 Upload
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const uploadRes = await axios.post(
        "https://a4stationbackend.onrender.com/upload",
        formData
      );

      const fileName = uploadRes.data.filename;

      // 🧾 Create order
      const { data: order } = await axios.post(
        "https://a4stationbackend.onrender.com/create-order",
        {
         pages : effectivePages,
         copies : copies,
         printType : printType,
        }
      );

      const options = {
        key: "rzp_test_SZLF8MfqEd0ec7",
        amount: order.amount,
        currency: "INR",
        name: "A4Station",
        description: "Print Service",
        order_id: order.id,

        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              "https://a4stationbackend.onrender.com/verify-payment",
              {
                ...response,
                fileName,
              }
            );

            // 🔥 Order code logic
            let orderCode;

            if (verifyRes.data.success && verifyRes.data.code) {
              orderCode = verifyRes.data.code;
            } else {
              orderCode = generateCode(); // fallback
            }

            // 🔥 Save in Firestore
            await addDoc(collection(db, "orders"), {
              code: orderCode,
              amount: totalAmount,
              pages: effectivePages,
              copies,
              printType,
              printSide,
              date: new Date().toLocaleString(),
              userId: auth.currentUser.uid,
              kioskId: selectedKiosk.id,
              kioskName: selectedKiosk.name,
              status: "pending",
            });

            setCode(orderCode);
            setPaid(true);
          } catch (err) {
            console.error(err);
            alert("Verification failed");
          }
        },

        theme: { color: colors.primary },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", paddingBottom: "90px" }}>
      <button
        onClick={() => setPage("home")}
        style={{
          background: "none",
          border: "none",
          color: colors.primary,
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      >
        ⬅ Back
      </button>

      {!paid ? (
        <div>
          {/* KIOSK BADGE */}
          <div style={{ background: "#EAF2FF", color: "#2563EB", padding: "10px 15px", borderRadius: "10px", display: "inline-block", fontWeight: "600", fontSize: "14px", marginBottom: "20px" }}>
            📍 Kiosk: {selectedKiosk?.name || "Not selected"}
          </div>

          {/* UPLOAD ZONE */}
          <div style={{
            border: "2px dashed #cbd5e1",
            borderRadius: "16px",
            padding: "30px",
            textAlign: "center",
            background: "#ffffff",
            position: "relative",
            cursor: "pointer",
            transition: "0.2s",
            marginBottom: "20px"
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = "#2563EB"}
          onMouseOut={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
          >
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer"
              }}
            />
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>📤</div>
            <h3 style={{ margin: "0 0 5px 0", color: "#0F172A" }}>Select Documents</h3>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Click or press to upload PDF files</p>
          </div>

          {/* PREVIEW */}
          {previews.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h4 style={{ margin: 0, color: "#0F172A" }}>Document Preview</h4>
                <span style={{ background: "#F1F5F9", color: "#475569", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>{pages} Pages Detected</span>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "nowrap", overflowX: "auto", padding: "10px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                    <p style={{ position: "absolute", top: "4px", left: "4px", background: "rgba(15, 23, 42, 0.7)", color: "#fff", padding: "2px 6px", borderRadius: "6px", fontSize: "11px", margin: 0, fontWeight: "600" }}>{i + 1}</p>
                    <img
                      src={src}
                      alt={`Preview ${i+1}`}
                      onClick={() => setSelectedPreview(src)}
                      style={{ width: "80px", height: "110px", objectFit: "contain", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "zoom-in", background: "#fff", transition: "all 0.2s ease" }}
                      onMouseOver={(e) => { e.target.style.boxShadow = "0 8px 16px rgba(37,99,235,0.2)"; e.target.style.borderColor = "#2563EB"; }}
                      onMouseOut={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = "#cbd5e1"; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS PANELS */}
          <h3 style={{ margin: "25px 0 15px 0", color: "#0F172A", fontSize: "18px" }}>Print Preferences</h3>

          {/* COLOR MODE CARD */}
          <div style={{ background: "#ffffff", border: "1px solid #EAF2FF", borderRadius: "16px", padding: "16px", marginBottom: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
            <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Color Mode</p>
            <div style={{ display: "flex", gap: "12px" }}>
              <div 
                onClick={() => setPrintType("bw")}
                style={{ flex: 1, padding: "16px 10px", textAlign: "center", borderRadius: "12px", border: printType === "bw" ? "2px solid #2563EB" : "2px solid #f1f5f9", background: printType === "bw" ? "#F0F5FF" : "#ffffff", cursor: "pointer", transition: "0.2s" }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px", filter: "grayscale(100%)" }}>📄</div>
                <div style={{ color: printType === "bw" ? "#2563EB" : "#475569", fontWeight: "700", fontSize: "14px" }}>Black & White</div>
                <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>₹5 / page</div>
              </div>
              <div 
                onClick={() => setPrintType("color")}
                style={{ flex: 1, padding: "16px 10px", textAlign: "center", borderRadius: "12px", border: printType === "color" ? "2px solid #2563EB" : "2px solid #f1f5f9", background: printType === "color" ? "#F0F5FF" : "#ffffff", cursor: "pointer", transition: "0.2s" }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎨</div>
                <div style={{ color: printType === "color" ? "#2563EB" : "#475569", fontWeight: "700", fontSize: "14px" }}>Color Print</div>
                <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>₹10 / page</div>
              </div>
            </div>
          </div>

          {/* SIDES CARD */}
          <div style={{ background: "#ffffff", border: "1px solid #EAF2FF", borderRadius: "16px", padding: "16px", marginBottom: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
            <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Page Sides</p>
            <div style={{ display: "flex", gap: "12px" }}>
              <div 
                onClick={() => setPrintSide("single")}
                style={{ flex: 1, padding: "14px 10px", textAlign: "center", borderRadius: "12px", border: printSide === "single" ? "2px solid #2563EB" : "2px solid #f1f5f9", background: printSide === "single" ? "#F0F5FF" : "#ffffff", cursor: "pointer", transition: "0.2s" }}
              >
                <div style={{ color: printSide === "single" ? "#2563EB" : "#475569", fontWeight: "700", fontSize: "14px" }}>Single Sided</div>
              </div>
              <div 
                onClick={() => setPrintSide("double")}
                style={{ flex: 1, padding: "14px 10px", textAlign: "center", borderRadius: "12px", border: printSide === "double" ? "2px solid #2563EB" : "2px solid #f1f5f9", background: printSide === "double" ? "#F0F5FF" : "#ffffff", cursor: "pointer", transition: "0.2s" }}
              >
                <div style={{ color: printSide === "double" ? "#2563EB" : "#475569", fontWeight: "700", fontSize: "14px" }}>Double Sided</div>
                <div style={{ color: "#10B981", fontSize: "11px", marginTop: "4px", fontWeight: "bold" }}>Saves Paper 🌱</div>
              </div>
            </div>
          </div>

          {/* COPIES CARD */}
          <div style={{ background: "#ffffff", border: "1px solid #EAF2FF", borderRadius: "16px", padding: "20px 16px", marginBottom: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: "0", fontSize: "16px", color: "#0F172A", fontWeight: "700" }}>How many copies?</p>
            <div style={{ display: "flex", alignItems: "center", background: "#F1F5F9", borderRadius: "12px", padding: "5px" }}>
              <button 
                onClick={() => setCopies(Math.max(1, copies - 1))}
                style={{ width: "40px", height: "40px", borderRadius: "8px", border: "none", background: "#ffffff", color: "#0F172A", fontSize: "20px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}
              >-</button>
              <span style={{ width: "45px", textAlign: "center", fontWeight: "bold", fontSize: "18px", color: "#2563EB" }}>{copies}</span>
              <button 
                onClick={() => setCopies(copies + 1)}
                style={{ width: "40px", height: "40px", borderRadius: "8px", border: "none", background: "#ffffff", color: "#0F172A", fontSize: "20px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}
              >+</button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", padding: "10px" }}>
             <p style={{ margin: 0, color: "#64748b", fontWeight: "500" }}>Total Amount:</p>
             <h2 style={{ margin: 0, color: "#0F172A", fontSize: "28px" }}>₹{totalAmount}</h2>
          </div>

          <button className="pay-btn" style={{ marginTop: "20px" }} onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Pay & Print"}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <h2>🎉 Payment Successful</h2>
          <p>Your Order Code:</p>
          <h1 style={{ color: colors.primary }}>{code}</h1>
        </div>
      )}

      {/* BIG PREVIEW FULLSCREEN MODAL */}
      {selectedPreview && (
        <div
          onClick={() => setSelectedPreview(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(15, 23, 42, 0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
            boxSizing: "border-box"
          }}
        >
          <div style={{ position: "relative", maxWidth: "100%", maxHeight: "100%" }}>
            <button
              onClick={() => setSelectedPreview(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0px",
                background: "#EF4444",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "16px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              ✕
            </button>
            <img 
              src={selectedPreview} 
              alt="Big Preview Fullscreen" 
              onClick={(e) => e.stopPropagation()}
              style={{ 
                maxWidth: "100%", 
                maxHeight: "85vh", 
                borderRadius: "8px", 
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                background: "#fff"
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PrintPage;