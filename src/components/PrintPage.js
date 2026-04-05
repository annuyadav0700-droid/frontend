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

  // 📂 FILE SELECT
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
        previewArr.push(URL.createObjectURL(file));
      }
    }

    setPages(totalPages);
    setPreviews(previewArr);
  };

  // 💳 PAYMENT
  const handlePayment = async () => {
    const selectedKiosk = JSON.parse(localStorage.getItem("selectedKiosk"));

    if (!selectedKiosk) {
      alert("Please select a kiosk first");
      return;
    }

    if (files.length === 0) {
      alert("Upload file first");
      return;
    }

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await axios.post(
        "https://a4stationbackend.onrender.com/upload",
        formData
      );

      const uploadedFileName = res.data.filename;

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
        order_id: order.id,

        handler: async function (response) {
          const verify = await axios.post(
            "https://a4stationbackend.onrender.com/verify-payment",
            {
              ...response,
              fileName: uploadedFileName,
            }
          );

          if (verify.data.success) {
            await addDoc(collection(db, "orders"), {
              code: verify.data.code,
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

            setCode(verify.data.code);
            setPaid(true);
          }
        },

        theme: { color: colors.primary },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  return (
    <div style={{ padding: "20px", paddingBottom: "90px" }}>
      
      <button onClick={() => setPage("home")}>⬅ Back</button>

      {!paid ? (
        <div
          style={{
            marginTop: "15px",
            padding: "20px",
            borderRadius: "16px",
            background: colors.white,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          <h2>Print Document</h2>

          <input
            type="file"
            multiple
            onChange={handleFileChange}
          />

          <p>Pages: {pages}</p>

          {/* PREVIEW */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {previews.map((src, i) => (
              <img key={i} src={src} style={{ width: "80px", borderRadius: "8px" }} />
            ))}
          </div>

          <h3>Total: ₹ {totalAmount}</h3>

          <button
            onClick={handlePayment}
            style={{
              marginTop: "15px",
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: colors.primary,
              color: colors.white,
              fontWeight: "600",
            }}
          >
            Pay & Print
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h2>🎉 Payment Successful</h2>
          <p>Your Code:</p>
          <h1 style={{ color: colors.primary }}>{code}</h1>

          <button onClick={() => setPage("home")}>
            Go Home
          </button>
        </div>
      )}
    </div>
  );
}

export default PrintPage;