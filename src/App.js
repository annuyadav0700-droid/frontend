import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function App() {
  const [files, setFiles] = useState([]);
  const [pages, setPages] = useState(0);
  const [copies, setCopies] = useState(1);
  const [printSide, setPrintSide] = useState("single"); // ✅ FIXED
  const [printType, setPrintType] = useState("bw");
  const [paid, setPaid] = useState(false);
  const [code, setCode] = useState("");

  const bwPrice = 5;
  const colorPrice = 10;

  const pricePerPage = printType === "color" ? colorPrice : bwPrice;

  // ✅ double side logic
  const effectivePages =
    printSide === "double" ? Math.ceil(pages / 2) : pages;

  const totalAmount = effectivePages * copies * pricePerPage;

  // FILE SELECT + PAGE COUNT
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    let totalPages = 0;

    for (let file of selectedFiles) {
      if (file.type === "application/pdf") {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        totalPages += pdf.numPages;
      } else {
        totalPages += 1;
      }
    }

    setPages(totalPages);
  };

  // UPLOAD FILE
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

  // PAYMENT
  const handlePayment = async () => {
    try {
      if (files.length === 0) {
        alert("Select file first");
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
        key: "rzp_test_SEWq0s9qENRJ4Z",
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
      console.error("Payment error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="app">
      {!paid ? (
        <div className="card">
          <h1 className="brand">A4Station</h1>

          {/* Upload */}
          <label className="upload-box">
            <input
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileChange}
              hidden
            />
            <div className="plus">+</div>
            <p>Upload Documents</p>
          </label>

          {/* Info */}
          <div className="info">
            <p>Files: {files.length}</p>
            <p>Total Pages: {pages}</p>
          </div>

          {/* Copies */}
          <div className="section">
            <label>Copies</label>
            <div className="counter">
              <button
                onClick={() => copies > 1 && setCopies(copies - 1)}
              >
                -
              </button>
              <span>{copies}</span>
              <button onClick={() => setCopies(copies + 1)}>+</button>
            </div>
          </div>

          {/* Print Type */}
          <div className="section">
            <label>Print Type</label>
            <div className="toggle">
              <button
                className={printType === "bw" ? "active" : ""}
                onClick={() => setPrintType("bw")}
              >
                B/W
              </button>
              <button
                className={printType === "color" ? "active" : ""}
                onClick={() => setPrintType("color")}
              >
                Color
              </button>
            </div>
          </div>

          {/* Print Side */}
          <div className="section">
            <label>Print Side</label>
            <div className="toggle">
              <button
                className={printSide === "single" ? "active" : ""}
                onClick={() => setPrintSide("single")}
              >
                Single
              </button>
              <button
                className={printSide === "double" ? "active" : ""}
                onClick={() => setPrintSide("double")}
              >
                Double
              </button>
            </div>
          </div>

          <h2 className="total">₹ {totalAmount}</h2>

          <button className="pay-btn" onClick={handlePayment}>
            Pay Now
          </button>
        </div>
      ) : (
        <div className="success">
          <h2>Payment Successful 🎉</h2>
          <p>Your Order Code</p>
          <h1>{code}</h1>
        </div>
      )}
    </div>
  );
}

export default App;
