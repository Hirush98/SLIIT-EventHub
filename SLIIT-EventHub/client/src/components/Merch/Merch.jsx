import React from "react";
import { Link } from "react-router-dom";
import "./Merch.css";

const CATEGORY_STYLES = {
  Clothing: "bg-blue-100 text-blue-700",
  Accessories: "bg-purple-100 text-purple-700",
  Stationery: "bg-yellow-100 text-yellow-700",
  Souvenir: "bg-pink-100 text-pink-700",
  Tech: "bg-indigo-100 text-indigo-700",
};

function Merch(props) {
  const { _id, name, price, stock, category, image, description } = props.merchandise;
  const imageUrl = image ? `http://localhost:4000${image}` : "";
  const isLowStock = Number(stock) > 0 && Number(stock) <= 10;
  const isOutOfStock = Number(stock) <= 0;

  return (
    <Link to={`/merch/${_id}`} className="merch-card-link">
      <article className="merch-card">
        <div className="merch-card-media">
          {imageUrl ? (
            <img className="merch-card-image" src={imageUrl} alt={name} />
          ) : (
            <div className="merch-card-placeholder">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V7a2 2 0 00-2-2h-3V4a2 2 0 10-4 0v1H8a2 2 0 00-2 2v6m14 0v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5m14 0H6" />
              </svg>
            </div>
          )}

          <span className={`merch-card-badge ${CATEGORY_STYLES[category] || "bg-gray-100 text-gray-700"}`}>
            {category}
          </span>

          {isOutOfStock ? (
            <span className="merch-stock-badge merch-stock-badge-full">Out of Stock</span>
          ) : isLowStock ? (
            <span className="merch-stock-badge merch-stock-badge-low">{stock} left</span>
          ) : null}
        </div>

        <div className="merch-card-body">
          <h3>{name}</h3>
          <p className="merch-card-description">
            {description || "Official SLIIT merchandise item."}
          </p>
          <div className="merch-card-footer">
            <span className="merch-card-price">LKR. {Number(price || 0).toLocaleString()}</span>
            <span className={`merch-card-stock ${isOutOfStock ? "stock-full" : isLowStock ? "stock-low" : "stock-open"}`}>
              {isOutOfStock ? "Unavailable" : `${stock} in stock`}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default Merch;
