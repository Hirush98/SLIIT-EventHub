import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import orderApi, { API_ROOT } from "../../api/orderApi";
import "./ViewOrder.css";

const getStatusText = (order) => {
  if (order.orderStatus === "completed") {
    return "Order completed";
  }

  if (order.paymentMethod === "collection") {
    return "Collect your order";
  }

  return order.paymentStatus === "confirmed"
    ? "Payment confirmed. Collect the merch at the outlet."
    : "Payment confirmation pending";
};

function ViewOrder() {
  const { orderId } = useParams();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const role = currentUser?.role || "participant";
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const backTo = location.state?.from || (role === "admin" ? "/payments" : "/orders");
  const backLabel = location.state?.label || (role === "admin" ? "Back to Payments" : "Back to Order History");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = role === "admin"
          ? await orderApi.getOrders()
          : await orderApi.getMyOrders();

        const matchedOrder = (data.orders || []).find(
          (item) => item.rawId === orderId || item.id === orderId,
        );

        if (!matchedOrder) {
          setOrder(null);
          setError("Order not found.");
          return;
        }

        setOrder(matchedOrder);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load order details.");
      }
    };

    loadOrder();
  }, [orderId, role]);

  return (
    <section className="view-order-page">
      <div className="section-heading">
        <p className="eyebrow">SLIIT Store</p>
        <h1>Order Details</h1>
        <p className="view-order-subtitle">
          Review the full merchandise order information, payment method, and item breakdown.
        </p>
      </div>

      <div className="view-order-toplink">
        <Link to={backTo}>{`← ${backLabel}`}</Link>
      </div>

      {error ? <p className="view-order-error">{error}</p> : null}

      {!error && order ? (
        <article className="view-order-card">
          <div className="view-order-header">
            <div>
              <p className="view-order-id">Order #{order.id}</p>
              <h2>{order.customerName || "Unknown User"}</h2>
              <p className="view-order-date">{new Date(order.placedAt).toLocaleString()}</p>
            </div>
            <span className="view-order-method">
              {order.paymentMethod === "bank" ? "Bank Transfer" : "Pay at Collection"}
            </span>
          </div>

          <div className="view-order-status-panel">
            <p className="view-order-label">Current Status</p>
            <h3>{getStatusText(order)}</h3>
            <p>
              Payment: {order.paymentStatus?.replaceAll("_", " ") || "Not available"} | Order:{" "}
              {order.orderStatus?.replaceAll("_", " ") || "Not available"}
            </p>
          </div>

          <div className="view-order-grid">
            <div className="view-order-block">
              <p className="view-order-label">Customer</p>
              <p>{order.customerName || "Unknown User"}</p>
              <span>{order.customerEmail || "No email available"}</span>
            </div>
            <div className="view-order-block">
              <p className="view-order-label">Items</p>
              <p>{order.items.length}</p>
            </div>
            <div className="view-order-block">
              <p className="view-order-label">Full Amount</p>
              <p>Rs. {Number(order.total || 0).toLocaleString()}</p>
            </div>
            <div className="view-order-block">
              <p className="view-order-label">Payment Slip</p>
              {order.paymentSlipPath ? (
                <a
                  href={`${API_ROOT}${order.paymentSlipPath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="view-order-slip-link"
                >
                  {order.paymentSlipName || "View uploaded slip"}
                </a>
              ) : (
                <p>{order.paymentSlipName || "Not required"}</p>
              )}
            </div>
          </div>

          <div className="view-order-items">
            <p className="view-order-label">Merchandise Details</p>
            {order.items.map((item) => (
              <div key={`${order.id}-${item.id}`} className="view-order-item-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.category || "Merchandise item"}</span>
                </div>
                <span>Qty: {item.quantity}</span>
                <strong>
                  Rs. {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}
                </strong>
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
}

export default ViewOrder;
