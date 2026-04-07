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
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

        totalPages += pdf.numPages;

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

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
      <button onClick={() => setPage("home")}>⬅ Back</button>

      {!paid ? (
        <div>
          <h2>Print Document</h2>

          <p>Kiosk: {selectedKiosk?.name || "Not selected"}</p>

          <input type="file" multiple onChange={handleFileChange} />

          <p>Pages: {pages}</p>

          {/* PREVIEW */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                style={{ width: "120px", borderRadius: "10px" }}
              />
            ))}
          </div>

          {/* SETTINGS */}
          <div>
            <p>Copies:</p>
            <input
              type="number"
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
            />

            <p>Type:</p>
            <select onChange={(e) => setPrintType(e.target.value)}>
              <option value="bw">B/W</option>
              <option value="color">Color</option>
            </select>

            <p>Side:</p>
            <select onChange={(e) => setPrintSide(e.target.value)}>
              <option value="single">Single</option>
              <option value="double">Double</option>
            </select>
          </div>

          <h3>Total: ₹ {totalAmount}</h3>

          <button onClick={handlePayment} disabled={loading}>
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
    </div>
  );
}

export default PrintPage;