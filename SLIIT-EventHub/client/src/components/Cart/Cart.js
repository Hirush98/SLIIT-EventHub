import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";

const initialCartItems = [
  {
    id: 1,
    name: "SLIIT Classic Hoodie",
    category: "Apparel",
    price: 4500,
    quantity: 1,
  },
  {
    id: 2,
    name: "Campus Essentials Tote",
    category: "Accessories",
    price: 1800,
    quantity: 2,
  },
];

function Cart() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id, change) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    );
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shipping = cartItems.length > 0 ? 500 : 0;
  const total = subtotal + shipping;

  return (
    <section className="cart-page">
      <div className="section-heading">
        <p className="eyebrow">SLIIT Store</p>
        <h1>Your Cart</h1>
        <p className="cart-subtitle">
          Review your selected merchandise before moving on to checkout.
        </p>
      </div>

      <div className="cart-layout">
        <div className="cart-list-card">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <h2>Your cart is empty</h2>
              <p>Add campus merchandise to get started.</p>
              <Link to="/merch" className="cart-primary-action">
                Browse merchandise
              </Link>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <article key={item.id} className="cart-item">
                  <div className="cart-item-copy">
                    <p className="cart-item-category">{item.category}</p>
                    <h2>{item.name}</h2>
                    <p className="cart-item-price">
                      Rs. {item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="cart-item-meta">
                    <div className="cart-quantity-control">
                      <button
                        type="button"
                        className="cart-quantity-button"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity === 1}
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        -
                      </button>
                      <span className="cart-quantity-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="cart-quantity-button"
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <strong>
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </strong>
                  </div>
                </article>
              ))}
              <Link to="/merch" className="cart-secondary-link">
                Continue shopping
              </Link>
            </>
          )}
        </div>

        <aside className="cart-summary-card">
          <p className="cart-summary-label">Order Summary</p>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <strong>Rs. {subtotal.toLocaleString()}</strong>
          </div>
          <div className="cart-summary-row">
            <span>Delivery</span>
            <strong>Rs. {shipping.toLocaleString()}</strong>
          </div>
          <div className="cart-summary-total">
            <span>Total</span>
            <strong>Rs. {total.toLocaleString()}</strong>
          </div>
          <Link to="/checkout" className="cart-primary-action">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default Cart;
