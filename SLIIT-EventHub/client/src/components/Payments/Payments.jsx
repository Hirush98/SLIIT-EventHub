import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import orderApi, { API_ROOT } from "../../api/orderApi";
import "./Payments.css";

const getStatusLabel = (order) => {
  const paymentMethod = String(order.paymentMethod || "").toLowerCase();

  if (order.orderStatus === "completed") {
    return "Order Completed";
  }

  if (paymentMethod === "bank") {
    return order.paymentStatus === "confirmed"
      ? "Payment Confirmed"
      : "Payment Confirmation Pending";
  }

  return "Collect Your Order";
};

const getAvailableActions = (order) => {
  const paymentMethod = String(order.paymentMethod || "").toLowerCase();
  const actions = [];

  if (paymentMethod === "bank" && order.paymentStatus !== "confirmed") {
    actions.push({
      key: "confirm_payment",
      label: "Confirm Payment",
    });
  }

  if (
    order.orderStatus !== "completed" &&
    (paymentMethod === "collection" ||
      (paymentMethod === "bank" && order.paymentStatus === "confirmed"))
  ) {
    actions.push({
      key: "complete_order",
      label: "Complete Order",
    });
  }

  return actions;
};

function Payments() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadOrders = async () => {
    try {
      const data = await orderApi.getOrders();
      setOrders(data.orders || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load payment details.");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOrderAction = async (orderId, action) => {
    try {
      await orderApi.updateOrderStatus(orderId, action);
      const successMessage = action === "confirm_payment"
        ? "Payment Approved"
        : "Order Completed Successfully";

      if (action === "complete_order") {
        const stockUpdateStamp = String(Date.now());
        localStorage.setItem("merch-stock-updated-at", stockUpdateStamp);
        window.dispatchEvent(new Event("merch-stock-updated"));
      }

      setActionMessage(successMessage);
      window.alert(successMessage);
      await loadOrders();
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Unable to update order.");
    }
  };

  const matchesSearch = (order) => {
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
  };

  const activeOrders = orders.filter((order) => order.orderStatus !== "completed");
  const filteredOrders = activeOrders.filter(matchesSearch);
  const bankOrders = filteredOrders.filter(
    (order) => String(order.paymentMethod || "").toLowerCase() === "bank",
  );
  const collectionOrders = filteredOrders.filter(
    (order) => String(order.paymentMethod || "").toLowerCase() === "collection",
  );

  const renderOrders = (list) => (
    <div className="payments-table-wrap">
      <table className="payments-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Slip</th>
            <th>Status</th>
            <th>View</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((order) => {
            const actions = getAvailableActions(order);

            return (
              <tr key={order.id}>
                <td>
                  <p className="payments-order-id">Order #{order.id}</p>
                </td>
                <td>
                  <strong>{order.customerName || "Unknown User"}</strong>
                  <span className="payments-subtext">{order.customerEmail || "No email available"}</span>
                </td>
                <td>
                  <p className="payments-subtext">{new Date(order.placedAt).toLocaleString()}</p>
                </td>
                <td>
                  <div className="payments-items-compact">
                    <span>{order.items.length} items</span>
                    <span className="payments-subtext">
                      {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                    </span>
                  </div>
                </td>
                <td>
                  <strong>Rs. {Number(order.total || 0).toLocaleString()}</strong>
                </td>
                <td>
                  {order.paymentSlipPath ? (
                    <a
                      href={`${API_ROOT}${order.paymentSlipPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="payments-slip-link"
                    >
                      View Slip
                    </a>
                  ) : (
                    <span className="payments-subtext">Not required</span>
                  )}
                </td>
                <td>
                  <span className={`payments-status ${order.paymentMethod}`}>
                    {getStatusLabel(order)}
                  </span>
                </td>
                <td>
                  <Link
                    to={`/orders/view/${order.rawId}`}
                    state={{ from: "/payments", label: "Back to Payments" }}
                    className="payments-view-link"
                  >
                    View Order
                  </Link>
                </td>
                <td>
                  {actions.length > 0 ? (
                    <div className="payments-actions">
                      {actions.map((action) => (
                        <button
                          key={`${order.id}-${action.key}`}
                          type="button"
                          className="payments-action-button"
                          onClick={() => handleOrderAction(order.rawId, action.key)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="payments-action-note">No pending action</p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="payments-page">
      <div className="section-heading">
        <p className="eyebrow">SLIIT Admin</p>
        <h1>Payments</h1>
        <p className="payments-subtitle">
          Review active merchandise payments and pending collections.
        </p>
      </div>

      <div className="payments-toplink">
        <Link to="/admin-orders">Order History →</Link>
      </div>

      <div className="payments-search">
        <svg
          className="payments-search-icon"
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
          aria-label="Search payment orders"
        />
      </div>

      {error ? <p className="payments-error">{error}</p> : null}
      {actionMessage ? <p className="payments-info">{actionMessage}</p> : null}

      {!error && activeOrders.length === 0 ? (
        <div className="payments-empty-state">
          <h2>No active payment orders</h2>
          <p>Pending bank transfers and collection orders will appear here for admin review.</p>
        </div>
      ) : !error && filteredOrders.length === 0 ? (
        <div className="payments-empty-state">
          <h2>No matching orders</h2>
          <p>Try searching by customer name, order ID, email, or merchandise item.</p>
        </div>
      ) : (
        <div className="payments-groups">
          <section className="payments-group">
            <div className="payments-group-head">
              <h2>Bank Transfer</h2>
              <span>{bankOrders.length} orders</span>
            </div>
            {bankOrders.length > 0 ? renderOrders(bankOrders) : (
              <div className="payments-empty-state payments-group-empty">
                <p>No bank transfer orders pending.</p>
              </div>
            )}
          </section>

          <section className="payments-group">
            <div className="payments-group-head">
              <h2>Pay at Collection</h2>
              <span>{collectionOrders.length} orders</span>
            </div>
            {collectionOrders.length > 0 ? renderOrders(collectionOrders) : (
              <div className="payments-empty-state payments-group-empty">
                <p>No collection orders pending.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export default Payments;
