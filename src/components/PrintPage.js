import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

import { db, auth } from "../firebase"; // ✅ FIXED
import { collection, addDoc } from "firebase/firestore";
const selectedKiosk = JSON.parse(localStorage.getItem("selectedKiosk"));
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function PrintPage({ setPage, setOrders }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]); // 🔥 NEW
  const [pages, setPages] = useState(0);
  
  const [copies, setCopies] = useState(1);
  const [printSide, setPrintSide] = useState("single");
  const [printType, setPrintType] = useState("bw");

  const [paid, setPaid] = useState(false);
  const [code, setCode] = useState("");

  const bwPrice = 5;
  const colorPrice = 10;

  const pricePerPage = printType === "color" ? colorPrice : bwPrice;

  const effectivePages =
    printSide === "double" ? Math.ceil(pages / 2) : pages;

  const totalAmount = effectivePages * copies * pricePerPage;

  // 📂 FILE SELECT + PREVIEW
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    let totalPages = 0;
    let previewArr = [];

    for (let file of selectedFiles) {
      if (file.type === "application/pdf") {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

        totalPages += pdf.numPages;

        // 🔥 PDF PREVIEW (first page)
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        previewArr.push(canvas.toDataURL());
      } else {
        totalPages += 1;

        // 🖼️ IMAGE PREVIEW
        previewArr.push(URL.createObjectURL(file));
      }
    }

    setPages(totalPages);
    setPreviews(previewArr);
  };

  // 📤 UPLOAD
  const uploadFiles = async () => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await axios.post(
      "https://a4stationbackend.onrender.com/upload",
      formData
    );

    if (!res.data.success) {
      alert("Upload failed");
      return null;
    }

    return res.data.filename;
  };

  // 💳 PAYMENT
  const selectedKiosk = JSON.parse(localStorage.getItem("selectedKiosk"));

if (!selectedKiosk) {
  alert("Please select a kiosk first");
  return;
}
  const handlePayment = async () => {
    try {
      if (files.length === 0) {
        alert("Please select a kiosk first");
        return;
      }

      const uploadedFileName = await uploadFiles();
      if (!uploadedFileName) return;

      const { data: order } = await axios.post(
        "https://a4stationbackend.onrender.com/create-order",
        {
          pages: effectivePages,
          copies,
          printType,
          printSide,
        }
      );

      const options = {
        key: "rzp_test_SZLF8MfqEd0ec7",
        amount: order.amount,
        currency: "INR",
        name: "A4Station",
        description: "Printing Payment",
        order_id: order.id,

        handler: async function (response) {
          const verify = await axios.post(
            "https://a4stationbackend.onrender.com/verify-payment",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              fileName: uploadedFileName,
            }
          );

          if (verify.data.success) {
            const newOrder = {
              code: verify.data.code,
              amount: totalAmount,
              pages: effectivePages,
              copies,
              printType,
              printSide,
              date: new Date().toLocaleString(),
            };

            await addDoc(collection(db, "orders"), {
           ...newOrder,
             userId: auth.currentUser.uid,

           // 🔥 NEW (IMPORTANT)
            kioskId: selectedKiosk.id,
            kioskName: selectedKiosk.name,

            status: "pending",
             });

            
            setCode(verify.data.code);
            setPaid(true);
          } else {
            alert("Payment verification failed");
          }
        },

        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment error");
    }
  };

  return (
    <div className="print-page">
      <button onClick={() => setPage("dashboard")}>⬅ Back</button>

      {!paid ? (
        <div className="card">
          <h2>Print Document</h2>

          {/* Upload */}
          <input
            type="file"
            multiple
            accept=".pdf,image/*"
            onChange={handleFileChange}
          />

          <p>Files: {files.length}</p>
          <p>Total Pages: {pages}</p>

          {/* 🔥 PREVIEW */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="preview"
                style={{ width: "100px", borderRadius: "8px" }}
              />
            ))}
          </div>

          {/* Copies */}
          <div>
            <label>Copies:</label>
            <button onClick={() => copies > 1 && setCopies(copies - 1)}>
              -
            </button>
            <span>{copies}</span>
            <button onClick={() => setCopies(copies + 1)}>+</button>
          </div>

          {/* Type */}
          <div>
            <label>Print Type:</label>
            <button onClick={() => setPrintType("bw")}>B/W</button>
            <button onClick={() => setPrintType("color")}>Color</button>
          </div>

          {/* Side */}
          <div>
            <label>Print Side:</label>
            <button onClick={() => setPrintSide("single")}>Single</button>
            <button onClick={() => setPrintSide("double")}>Double</button>
          </div>

          <h3>Total: ₹ {totalAmount}</h3>

          <button onClick={handlePayment}>Pay Now</button>
        </div>
      ) : (
        <div className="success">
          <h2>Payment Successful 🎉</h2>
          <p>Your Code:</p>
          <h1>{code}</h1>

          <button
            onClick={() => {
              setPaid(false);
              setPage("dashboard");
            }}
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default PrintPage;