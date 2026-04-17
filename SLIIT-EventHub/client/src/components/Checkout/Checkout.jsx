import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import orderApi from "../../api/orderApi";
import "./Checkout.css";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [message, setMessage] = useState("");
  const [generatedBill, setGeneratedBill] = useState(null);

  const checkoutItems = useMemo(
    () => location.state?.cartItems || [],
    [location.state],
  );
  const checkoutTotal = useMemo(
    () => Number(location.state?.total) || 0,
    [location.state],
  );
  const serviceCharge = checkoutItems.length > 0 ? 200 : 0;
  const subtotal = Math.max(checkoutTotal - serviceCharge, 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (checkoutItems.length === 0 || checkoutTotal <= 0) {
      setMessage("Your cart is empty. Add merchandise before checking out.");
      return;
    }

    if (paymentMethod === "bank" && !paymentSlip) {
      setMessage("Please upload your bank transaction slip before placing the order.");
      return;
    }

    try {
      const orderData = new FormData();
      orderData.append("items", JSON.stringify(checkoutItems));
      orderData.append("total", String(checkoutTotal));
      orderData.append("paymentMethod", paymentMethod);
      if (paymentMethod === "bank" && paymentSlip) {
        orderData.append("paymentSlip", paymentSlip);
        orderData.append("paymentSlipName", paymentSlip.name);
      }

      const response = await orderApi.placeOrder(orderData);

      const orderRecord = response.order;
      localStorage.removeItem("merchCart");

      if (paymentMethod === "bank") {
        setGeneratedBill(null);
        setMessage("Order placed. Payment confirmation is pending. The bill will be emailed after admin confirms your payment.");
        setTimeout(() => navigate("/cart"), 1200);
        return;
      }

      setGeneratedBill({
        orderId: orderRecord.id,
        customerName: orderRecord.customerName,
        customerEmail: orderRecord.customerEmail,
        placedAt: orderRecord.placedAt,
        items: orderRecord.items,
        total: orderRecord.total,
        notice: "Complete your Payment and Collect the Merchandise At Our Outlet",
      });
      setMessage(`Bill generated and emailed to ${orderRecord.customerEmail}.`);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to place the order. Please try again.",
      );
    }
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
          <p className="checkout-label">Order Summary</p>
          <div className="checkout-summary-total">
            <span>Subtotal</span>
            <strong>Rs. {subtotal.toLocaleString()}</strong>
          </div>
          <div className="checkout-summary-total">
            <span>Service Charges</span>
            <strong>Rs. {serviceCharge.toLocaleString()}</strong>
          </div>
          <div className="checkout-summary-total">
            <span>Items</span>
            <strong>{checkoutItems.length}</strong>
          </div>
          <div className="checkout-summary-total">
            <span>Full Amount</span>
            <strong>Rs. {checkoutTotal.toLocaleString()}</strong>
          </div>
          <p className="checkout-label">Payment Notes</p>
          <ul className="checkout-notes">
            <li>Choose only one payment method before submitting your order.</li>
            <li>Bank transaction requires uploading the payment slip.</li>
            <li>Pay at collecting items does not require any upload.</li>
          </ul>
        </aside>
      </div>

      {generatedBill ? (
        <section className="checkout-bill-card">
          <div className="checkout-bill-header">
            <div>
              <p className="checkout-label">Collection Bill</p>
              <h2>Merchandise Order Bill</h2>
            </div>
            <button
              type="button"
              className="checkout-secondary-action checkout-print-action"
              onClick={() => window.print()}
            >
              Print Bill
            </button>
          </div>

          <div className="checkout-bill-grid">
            <div className="checkout-bill-block">
              <p className="checkout-label">Customer Name</p>
              <strong>{generatedBill.customerName || "Not available"}</strong>
            </div>
            <div className="checkout-bill-block">
              <p className="checkout-label">Email Address</p>
              <strong>{generatedBill.customerEmail || "Not available"}</strong>
            </div>
            <div className="checkout-bill-block">
              <p className="checkout-label">Order ID</p>
              <strong>{generatedBill.orderId}</strong>
            </div>
            <div className="checkout-bill-block">
              <p className="checkout-label">Order Date & Time</p>
              <strong>{new Date(generatedBill.placedAt).toLocaleString()}</strong>
            </div>
          </div>

          <div className="checkout-bill-items">
            <p className="checkout-label">Merchandise Details</p>
            {generatedBill.items.map((item) => (
              <div key={`${generatedBill.orderId}-${item.id}`} className="checkout-bill-item-row">
                <span>{item.name}</span>
                <span>Qty: {item.quantity}</span>
                <strong>
                  Rs. {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-bill-total">
            <span>Full Amount</span>
            <strong>Rs. {Number(generatedBill.total || 0).toLocaleString()}</strong>
          </div>

          <p className="checkout-bill-notice">
            {generatedBill.notice}
          </p>
        </section>
      ) : null}
    </section>
  );
}

export default Checkout;
