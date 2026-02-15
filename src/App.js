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

    console.log("Uploaded filename:", res.data.filename);
    return res.data.filename; // IMPORTANT
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
        { pages, copies, printType }
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

          console.log("Verify Response:", verify.data);

          if (verify.data.success) {
            setCode(verify.data.code);
            setPaid(true);
          } else {
            alert("Payment verification failed");
          }
        },

        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {!paid ? (
          <>
            <h1 style={styles.title}>A4Station</h1>

            <input
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileChange}
            />

            <p>Files: {files.length}</p>
            <p>Total Pages: {pages}</p>

            <div>
              <label>Copies: </label>
              <input
                type="number"
                value={copies}
                min="1"
                onChange={(e) => setCopies(Number(e.target.value))}
              />
            </div>

            <div>
              <button onClick={() => setPrintType("bw")}>B/W ₹5</button>
              <button onClick={() => setPrintType("color")}>Color ₹10</button>
            </div>

            <h2>Total: ₹{totalAmount}</h2>

            <button onClick={handlePayment}>
              Pay & Generate OTP
            </button>
          </>
        ) : (
          <>
            <h2>✅ Payment Successful</h2>
            <p>Your OTP:</p>
            <h1 style={{ fontSize: "40px", color: "green" }}>{code}</h1>
          </>
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
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
  },
};

export default App;