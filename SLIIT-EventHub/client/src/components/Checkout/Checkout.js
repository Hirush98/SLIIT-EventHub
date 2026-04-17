import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (paymentMethod === "bank" && !paymentSlip) {
      setMessage("Please upload your bank transaction slip before placing the order.");
      return;
    }

    if (paymentMethod === "bank") {
      setMessage(`Order placed with bank transaction slip: ${paymentSlip.name}`);
      return;
    }

    setMessage("Order placed for pay at collection. Please pay when collecting your items.");
  };

  return (
    <section className="checkout-page">
      <div className="section-heading">
        <p className="eyebrow">SLIIT Store</p>
        <h1>Checkout</h1>
        <p className="checkout-subtitle">
          Select how you want to complete payment for your merchandise order.
        </p>
      </div>

      <div className="checkout-layout">
        <form className="checkout-card" onSubmit={handleSubmit}>
          <div className="checkout-block">
            <p className="checkout-label">Payment Method</p>
            <label className="checkout-option">
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <div>
                <strong>Bank transaction</strong>
                <p>Transfer the amount to the SLIIT account and upload the payment slip.</p>
              </div>
            </label>

            <label className="checkout-option">
              <input
                type="radio"
                name="paymentMethod"
                value="collection"
                checked={paymentMethod === "collection"}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <div>
                <strong>Pay at collecting items</strong>
                <p>Pay in person when you arrive to collect your order.</p>
              </div>
            </label>
          </div>

          {paymentMethod === "bank" ? (
            <div className="checkout-block">
              <div className="checkout-bank-details">
                <p className="checkout-label">Bank Details</p>
                <div className="checkout-bank-grid">
                  <p>
                    <strong>Bank</strong>
                    <span>Sampath Bank PLC</span>
                  </p>
                  <p>
                    <strong>Account Number</strong>
                    <span>2347 7847 8276</span>
                  </p>
                  <p>
                    <strong>Name</strong>
                    <span>SLIIT ESM</span>
                  </p>
                  <p>
                    <strong>Branch</strong>
                    <span>Malabe</span>
                  </p>
                </div>
              </div>

              <label htmlFor="paymentSlip" className="checkout-label">
                Upload Bank Slip
              </label>
              <input
                id="paymentSlip"
                className="checkout-file-input"
                type="file"
                accept="image/*,.pdf"
                onChange={(event) =>
                  setPaymentSlip(event.target.files?.[0] || null)
                }
              />
              <label htmlFor="paymentSlip" className="checkout-upload-box">
                <span className="checkout-upload-badge">Upload</span>
                <span className="checkout-upload-title">
                  {paymentSlip ? "Replace payment slip" : "Choose your payment slip"}
                </span>
                <span className="checkout-upload-subtitle">
                  Drag is optional. Click here to browse for an image or PDF.
                </span>
                <span className="checkout-upload-meta">JPG, PNG or PDF</span>
              </label>
              <p className="checkout-help-text">
                Accepted formats: image files or PDF. This is required for bank transactions.
              </p>
              {paymentSlip ? (
                <p className="checkout-file-name">Selected: {paymentSlip.name}</p>
              ) : null}
            </div>
          ) : null}

          {message ? <p className="checkout-message">{message}</p> : null}

          <div className="checkout-actions">
            <Link to="/cart" className="checkout-secondary-action">
              Back to cart
            </Link>
            <button type="submit" className="checkout-primary-action">
              Place order
            </button>
          </div>
        </form>

        <aside className="checkout-summary-card">
          <p className="checkout-label">Payment Notes</p>
          <ul className="checkout-notes">
            <li>Choose only one payment method before submitting your order.</li>
            <li>Bank transaction requires uploading the payment slip.</li>
            <li>Pay at collecting items does not require any upload.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
