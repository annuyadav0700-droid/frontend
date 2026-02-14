import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function App() {
  const [files, setFiles] = useState([]);
  const [pages, setPages] = useState(0);
  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState("bw");
  const [paid, setPaid] = useState(false);
  const [code, setCode] = useState("");

  const bwPrice = 5;
  const colorPrice = 10;
  const pricePerPage = printType === "color" ? colorPrice : bwPrice;
  const totalAmount = pages * copies * pricePerPage;

  // HANDLE FILE SELECTION
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    let pdfCount = 0;
    let imageCount = 0;
    let validFiles = [];

    for (let file of selectedFiles) {
      if (file.type === "application/pdf") {
        pdfCount++;
        if (pdfCount > 1) { alert("Only 1 PDF allowed!"); continue; }
      } else if (file.type.startsWith("image/")) {
        imageCount++;
        if (imageCount > 5) { alert("Max 5 images allowed!"); continue; }
      }
      validFiles.push(file);
    }
    setFiles(validFiles);

    // COUNT TOTAL PAGES
    let totalPages = 0;
    for (let file of validFiles) {
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

  // UPLOAD FILES
  const uploadFiles = async () => {
    if (files.length === 0) return null;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await axios.post(
      "https://a4stationbackend.onrender.com/upload",
      formData
    );

    if (!res.data.success) {
      alert("File upload failed");
      return null;
    }

    // BACKEND NE JO FILE SAVE KIYA USKA NAME
    return res.data.files[0];
  };

  // HANDLE PAYMENT
  const handlePayment = async () => {
    try {
      const uploadedFileName = await uploadFiles();
      if (!uploadedFileName) return;

      // CREATE ORDER
      const { data: order } = await axios.post(
        "https://a4stationbackend.onrender.com/create-order",
        { pages, copies, printType }
      );

      const options = {
        key: "rzp_test_SEWq0s9qENRJ4Z",
        amount: order.amount,
        currency: "INR",
        name: "A4Station",
        description: "",
        order_id: order.id,

        handler: async function (response) {
          // VERIFY PAYMENT WITH CORRECT FILENAME
          const verify = await axios.post(
            "https://a4stationbackend.onrender.com/verify-payment",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              fileName: uploadedFileName, // ✅ Correct file
            }
          );

          if (verify.data.success) {
            setCode(verify.data.code);
            setPaid(true);
          } else {
            alert("Payment verification failed");
          }
        },

        theme: { color: "#4facfe" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {!paid ? (
          <>
            <h1 style={styles.title}>A4Station</h1>

            <label style={styles.uploadBox}>
              📂 Select Files
              <input
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={handleFileChange}
                hidden
              />
            </label>

            <p style={styles.info}>Files Selected: {files.length}</p>
            <p style={styles.info}>Total Pages: {pages}</p>

            <div style={styles.row}>
              <label>Copies:</label>
              <input
                type="number"
                min="1"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <button
                style={printType === "bw" ? styles.activeBtn : styles.btn}
                onClick={() => setPrintType("bw")}
              >
                B/W ₹5
              </button>
              <button
                style={printType === "color" ? styles.activeBtn : styles.btn}
                onClick={() => setPrintType("color")}
              >
                Color ₹10
              </button>
            </div>

            <h2 style={styles.amount}>₹ {totalAmount}</h2>

            {files.length > 0 && (
              <button style={styles.payBtn} onClick={handlePayment}>
                Pay & Print
              </button>
            )}
          </>
        ) : (
          <div style={styles.successBox}>
            <h2>✅ Payment Successful</h2>
            <p>Your Print Code</p>
            <h1 style={styles.code}>{code}</h1>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles same as your previous code
const styles = { /* same as your previous styles */ };

export default App;
