import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import orderApi from "../../api/orderApi";
import "./AdminOrders.css";

const groupByPaymentMethod = (orders) => ({
  bank: orders.filter((order) => String(order.paymentMethod || "").toLowerCase() === "bank"),
  collection: orders.filter((order) => String(order.paymentMethod || "").toLowerCase() === "collection"),
});

const OrderTable = ({ title, orders }) => (
  <section className="admin-orders-section">
    <div className="admin-orders-section-head">
      <h2>{title}</h2>
      <span>{orders.length} orders</span>
    </div>

    {orders.length === 0 ? (
      <div className="admin-orders-empty">
        <p>No completed orders in this category.</p>
      </div>
    ) : (
      <div className="admin-orders-table-wrap">
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  <strong>{order.customerName}</strong>
                  <span>{order.customerEmail}</span>
                </td>
                <td>{new Date(order.placedAt).toLocaleString()}</td>
                <td>{order.items.length}</td>
                <td>Rs. {Number(order.total || 0).toLocaleString()}</td>
                <td>
                  <span className="admin-orders-status">Completed</span>
                </td>
                <td>
                  <Link
                    to={`/orders/view/${order.rawId}`}
                    state={{ from: "/admin-orders", label: "Back to Order History" }}
                    className="admin-orders-view-link"
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

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderApi.getOrders();
        const completedOrders = (data.orders || []).filter(
          (order) => order.orderStatus === "completed",
        );
        setOrders(completedOrders);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load completed orders.");
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const searchableText = [
      order.id,
      order.customerName,
      order.customerEmail,
      order.paymentMethod,
      ...order.items.map((item) => `${item.name} ${item.category || ""}`),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  const groupedOrders = groupByPaymentMethod(filteredOrders);

  return (
    <section className="admin-orders-page">
      <div className="section-heading">
        <p className="eyebrow">SLIIT Admin</p>
        <h1>Order History</h1>
        <p className="admin-orders-subtitle">
          View all completed merchandise orders grouped by payment method.
        </p>
      </div>

      <div className="admin-orders-toplink">
        <Link to="/payments">← Back to Payments</Link>
      </div>

      <div className="admin-orders-search">
        <svg
          className="admin-orders-search-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by order ID, customer, email, or item"
          aria-label="Search completed orders"
        />
      </div>

      {error ? <p className="admin-orders-error">{error}</p> : null}

      {!error && orders.length === 0 ? (
        <div className="admin-orders-empty">
          <p>No completed orders yet.</p>
        </div>
      ) : !error && filteredOrders.length === 0 ? (
        <div className="admin-orders-empty">
          <p>No completed orders match your search.</p>
        </div>
      ) : (
        <div className="admin-orders-layout">
          <OrderTable title="Bank Transfer Orders" orders={groupedOrders.bank} />
          <OrderTable title="Pay at Collection Orders" orders={groupedOrders.collection} />
        </div>
      )}
    </section>
  );
}

export default AdminOrders;
