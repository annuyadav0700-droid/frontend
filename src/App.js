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

<<<<<<< HEAD
  // File selection & pages calculation
=======
>>>>>>> 3694187e2ccd2089124a4160bc3f922afded2f4d
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    let pdfCount = 0;
    let imageCount = 0;
    let validFiles = [];

    for (let file of selectedFiles) {
      if (file.type === "application/pdf") {
        pdfCount++;
        if (pdfCount > 1) {
          alert("Only 1 PDF allowed!");
          continue;
        }
      } else if (file.type.startsWith("image/")) {
        imageCount++;
        if (imageCount > 5) {
          alert("Maximum 5 images allowed!");
          continue;
        }
      }
      validFiles.push(file);
    }

    setFiles(validFiles);

<<<<<<< HEAD
    // Calculate total pages
=======
>>>>>>> 3694187e2ccd2089124a4160bc3f922afded2f4d
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
<<<<<<< HEAD
    setPages(totalPages);
  };

  // Upload files to backend
  const uploadFiles = async () => {
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
    console.log("uploaded filename:",res.data.fileName);

    // Return uploaded file name
    // multer backend automatically stores filename in req.files[].filename
    return res.data.filename  
  };

  // Handle Razorpay Payment
  const handlePayment = async () => {
    try {
      const uploadedFileName = await uploadFiles();
      if (!uploadedFileName) return;
=======

    setPages(totalPages);
  };

  const uploadFiles = async () => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    await axios.post("https://a4stationbackend.onrender.com/upload", formData);
  };

  const handlePayment = async () => {
    try {
      await uploadFiles();
>>>>>>> 3694187e2ccd2089124a4160bc3f922afded2f4d

      const { data: order } = await axios.post(
        "https://a4stationbackend.onrender.com/create-order",
        { pages, copies, printType }
      );

      const options = {
<<<<<<< HEAD
        key: "rzp_test_SEWq0s9qENRJ4Z", // apni key
=======
        key: "rzp_test_SEWq0s9qENRJ4Z",
>>>>>>> 3694187e2ccd2089124a4160bc3f922afded2f4d
        amount: order.amount,
        currency: "INR",
        name: "A4Station",
        description: "Printing Payment",
        order_id: order.id,

        handler: async function (response) {
<<<<<<< HEAD
          // Verify payment & send file name to backend
          const verify = await axios.post(
            "https://a4stationbackend.onrender.com/verify-payment",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              fileName: uploadedFileName, // ✅ important
            }
          );

          console.log("VERIFY RESPONSE:", verify.data);

=======
          const verify = await axios.post(
            "https://a4stationbackend.onrender.com/verify-payment",
            response
          );

>>>>>>> 3694187e2ccd2089124a4160bc3f922afded2f4d
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
<<<<<<< HEAD
            <h1 style={styles.title}>A4Station</h1>
=======
            <h1 style={styles.title}>A4Station Print</h1>
>>>>>>> 3694187e2ccd2089124a4160bc3f922afded2f4d

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
<<<<<<< HEAD
                Pay & Generate OTP
=======
                Pay & Print
>>>>>>> 3694187e2ccd2089124a4160bc3f922afded2f4d
              </button>
            )}
          </>
        ) : (
          <div style={styles.successBox}>
            <h2>✅ Payment Successful</h2>
<<<<<<< HEAD
            <p>Your Print Code (OTP)</p>
            <h1 style={styles.code}>{code}</h1> {/* ✅ OTP displayed */}
            <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
              Use this code on the kiosk screen to print your file
            </p>
=======
            <p>Your Print Code</p>
            <h1 style={styles.code}>{code}</h1>
>>>>>>> 3694187e2ccd2089124a4160bc3f922afded2f4d
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f7fb",
    fontFamily: "Segoe UI, sans-serif",
  },
  card: {
    background: "#ffffff",
    padding: "35px",
    borderRadius: "18px",
    width: "370px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  title: {
    color: "#1e3a8a",
    marginBottom: "25px",
    fontWeight: "600",
  },
  uploadBox: {
    display: "block",
    padding: "14px",
    border: "2px dashed #3b82f6",
    borderRadius: "12px",
    cursor: "pointer",
    marginBottom: "15px",
    color: "#3b82f6",
    fontWeight: "500",
  },
  info: {
    margin: "6px 0",
    color: "#555",
    fontSize: "14px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    margin: "12px 0",
    alignItems: "center",
  },
  input: {
    width: "65px",
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  btn: {
    padding: "10px 18px",
    borderRadius: "8px",
    background: "#e0e7ff",
    border: "none",
    cursor: "pointer",
    color: "#1e3a8a",
    fontWeight: "500",
  },
  activeBtn: {
    padding: "10px 18px",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    border: "none",
    fontWeight: "500",
  },
  amount: {
    margin: "18px 0",
    fontSize: "22px",
    color: "#111",
    fontWeight: "600",
  },
  payBtn: {
    background: "#16a34a",
    color: "white",
    padding: "14px",
    width: "100%",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  successBox: {
    padding: "20px",
  },
  code: {
    fontSize: "42px",
    color: "#16a34a",
    letterSpacing: "6px",
    marginTop: "10px",
  },
};

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 3694187e2ccd2089124a4160bc3f922afded2f4d
