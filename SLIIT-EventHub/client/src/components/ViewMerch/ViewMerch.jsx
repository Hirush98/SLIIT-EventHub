import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "./ViewMerch.css";

const validateMerchForm = ({ name, price, description, stock, category }) => {
  const validationErrors = {};

  if (!name.trim()) {
    validationErrors.name = "Merchandise name is required.";
  }

  if (!price || Number(price) <= 0) {
    validationErrors.price = "Price must be greater than 0.";
  }

  if (!description.trim() || description.trim().length < 10) {
    validationErrors.description = "Description must be at least 10 characters.";
  }

  if (stock === "" || Number(stock) < 0) {
    validationErrors.stock = "Stock must be 0 or greater.";
  }

  if (!category.trim()) {
    validationErrors.category = "Category is required.";
  }

  return validationErrors;
};

function ViewMerch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [merch, setMerch] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    category: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const isAdmin = currentUser?.role === "admin";
  const isParticipant = currentUser?.role === "participant";

  useEffect(() => {
    if (!showPopup) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowPopup(false);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [showPopup]);

  useEffect(() => {
    const loadMerch = () => {
      axios
        .get(`http://localhost:4000/merch/${id}`, {
          headers: { "Cache-Control": "no-cache" },
          params: { ts: Date.now() },
        })
        .then((res) => {
          const merchData = res.data.merch;
          setMerch(merchData);
          setFormData({
            name: merchData.name || "",
            price: merchData.price || "",
            description: merchData.description || "",
            stock: merchData.stock || "",
            category: merchData.category || "",
          });
          setError("");
        })
        .catch(() => setError("Unable to load merchandise details."));
    };

    loadMerch();

    const handleFocus = () => {
      if (!isEditing) {
        loadMerch();
      }
    };
    const handleMerchStockUpdate = () => {
      if (!isEditing) {
        loadMerch();
      }
    };
    const handleStorage = (event) => {
      if (event.key === "merch-stock-updated-at" && !isEditing) {
        loadMerch();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("merch-stock-updated", handleMerchStockUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("merch-stock-updated", handleMerchStockUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setFormErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validationErrors = validateMerchForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to save these changes?");

    if (!isConfirmed) {
      return;
    }

    try {
      const res = await axios.put(`http://localhost:4000/merch/${id}`, formData);
      setMerch(res.data.merch);
      setIsEditing(false);
    } catch {
      setError("Unable to update merchandise.");
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this product?");

    if (!isConfirmed) {
      return;
    }

    try {
      await axios.delete(`http://localhost:4000/merch/${id}`);
      navigate("/merch");
    } catch {
      setError("Unable to delete merchandise.");
    }
  };

  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem("merchCart") || "[]");
    const existingItem = existingCart.find((item) => item.id === merch._id);

    const updatedCart = existingItem
      ? existingCart.map((item) =>
          item.id === merch._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      : [
          ...existingCart,
          {
            id: merch._id,
            name: merch.name,
            category: merch.category,
            price: Number(merch.price) || 0,
            quantity: 1,
          },
        ];

    localStorage.setItem("merchCart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
    setError("");
    setShowPopup(true);
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!merch) {
    return <p>Loading merchandise details...</p>;
  }

  const imageUrl = merch.image ? `http://localhost:4000${merch.image}` : "";

  if (isEditing && isAdmin) {
    return (
      <section className="form-section">
        <form className="sliit-form-card" onSubmit={handleUpdate}>
          <div className="section-heading">
            <p className="eyebrow">SLIIT Admin</p>
            <h1>Edit {merch.name}</h1>
          </div>

          <label className="form-field">
            <span>Name</span>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
            {formErrors.name && <small className="form-error">{formErrors.name}</small>}
          </label>

          <label className="form-field">
            <span>Price</span>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" />
            {formErrors.price && <small className="form-error">{formErrors.price}</small>}
          </label>

          <label className="form-field">
            <span>Description</span>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
            {formErrors.description && <small className="form-error">{formErrors.description}</small>}
          </label>

          <label className="form-field">
            <span>Stock</span>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stock" />
            {formErrors.stock && <small className="form-error">{formErrors.stock}</small>}
          </label>

          <label className="form-field">
            <span>Category</span>
            <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" />
            {formErrors.category && <small className="form-error">{formErrors.category}</small>}
          </label>

          <div className="button-row">
            <button className="detail-primary-button" type="submit">Save Changes</button>
            <button className="detail-secondary-button" type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="detail-section">
      <article className="detail-card">
        {showPopup ? (
          <div className="detail-popup-message">
            Added to cart
          </div>
        ) : null}
        <div className="detail-copy">
          <p className="eyebrow">SLIIT Merchandise Details</p>
          <h1>{merch.name}</h1>
          <p className="detail-price">LKR. {merch.price}</p>
          <p className="detail-description">{merch.description}</p>
          <div className="detail-meta">
            <span>Stock: {merch.stock}</span>
            <span>Category: {merch.category}</span>
          </div>
          <div className="button-row">
            {isAdmin ? (
              <>
                <button className="detail-primary-button" type="button" onClick={() => setIsEditing(true)}>Edit</button>
                <button className="detail-danger-button" type="button" onClick={handleDelete}>Delete</button>
              </>
            ) : null}
            {isParticipant ? (
              <button className="detail-primary-button" type="button" onClick={handleAddToCart}>
                Add to Cart
              </button>
            ) : null}
          </div>
          <Link className="detail-secondary-button back-link" to="/merch">Back to Merch List</Link>
        </div>
        <div className="detail-visual">
          {imageUrl && <img src={imageUrl} alt={merch.name} width="300" />}
        </div>
      </article>
    </section>
  );
}

export default ViewMerch;
