import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import orderApi from "../../api/orderApi";
import "./OrderHistory.css";

const getOrderStatusText = (order) => {
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

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderApi.getMyOrders();
        setOrders(data.orders || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load order history.");
      }
    };

    loadOrders();
  }, []);

  return (
    <section className="order-history-page">
      <div className="section-heading">
        <p className="eyebrow">SLIIT Store</p>
        <h1>Order History</h1>
        <p className="order-history-subtitle">
          View all your merchandise orders and their latest payment or collection status.
        </p>
      </div>

      {error ? <p className="order-history-error">{error}</p> : null}

      {!error && orders.length === 0 ? (
        <div className="order-history-empty-state">
          <h2>No orders yet</h2>
          <p>Your merchandise orders will appear here once you place them.</p>
        </div>
      ) : (
        <div className="order-history-table-wrap">
          <table className="order-history-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Merchandise</th>
                <th>Total</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <p className="order-history-id">{order.id}</p>
                    <p className="order-history-subtext">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </p>
                  </td>
                  <td>
                    <p className="order-history-maintext">
                      {new Date(order.placedAt).toLocaleString()}
                    </p>
                  </td>
                  <td>
                    <span className="order-history-method">
                      {order.paymentMethod === "bank" ? "Bank Transfer" : "Pay at Collection"}
                    </span>
                    <p className="order-history-subtext">
                      {order.paymentStatus?.replaceAll("_", " ") || "Not available"}
                    </p>
                  </td>
                  <td>
                    <p className="order-history-maintext">{getOrderStatusText(order)}</p>
                    <p className="order-history-subtext">
                      {order.orderStatus?.replaceAll("_", " ") || "Not available"}
                    </p>
                  </td>
                  <td>
                    <div className="order-history-items-list">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.id}`} className="order-history-item-row">
                          <span>{item.name}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <p className="order-history-total">
                      Rs. {Number(order.total || 0).toLocaleString()}
                    </p>
                  </td>
                  <td>
                    <Link
                      to={`/orders/view/${order.rawId}`}
                      state={{ from: "/orders", label: "Back to Order History" }}
                      className="order-history-view-link"
                    >
                      View Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default OrderHistory;
