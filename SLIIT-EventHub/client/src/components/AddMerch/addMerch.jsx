import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./addMerch.css";

const merchCategories = [
  "Packages",
  "T-Shirts",
  "Hoodies",
  "Caps",
  "Bags",
  "Water Bottles",
  "Notebooks",
  "Lanyards",
  "Stickers",
];

const validateMerchForm = (
  { name, price, description, stock, category },
  image,
  requireImage,
) => {
  const validationErrors = {};

  if (!name.trim()) {
    validationErrors.name = "Merchandise name is required.";
  }

  if (!price || Number(price) <= 0) {
    validationErrors.price = "Price must be greater than 0.";
  }

  if (!description.trim() || description.trim().length < 10) {
    validationErrors.description =
      "Description must be at least 10 characters.";
  }

  if (stock === "" || Number(stock) < 0) {
    validationErrors.stock = "Stock must be 0 or greater.";
  }

  if (!category.trim()) {
    validationErrors.category = "Category is required.";
  }

  if (requireImage && !image) {
    validationErrors.image = "Please upload an image.";
  }

  return validationErrors;
};

function AddMerch() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    category: "",
  });

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];

    if (droppedFile) {
      setImage(droppedFile);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateMerchForm(formData, image, true);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("stock", formData.stock);
    data.append("category", formData.category);
    data.append("image", image);

    try {
      const res = await axios.post("http://localhost:4000/merch", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Merch added:", res.data);
      navigate("/merch");
    } catch (error) {
      console.error(error);
      alert("Failed to add merch");
    }
  };

  return (
    <section className="form-section">
      <form className="sliit-form-card" onSubmit={handleSubmit}>
        <div className="section-heading">
          <p className="eyebrow">SLIIT Admin</p>
          <h1>Add Merchandise</h1>
        </div>

        <label className="form-field">
          <span>Merch Name</span>
          <input
            type="text"
            name="name"
            placeholder="Merch Name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <small className="form-error">{errors.name}</small>}
        </label>

        <label className="form-field">
          <span>Price</span>
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
          />
          {errors.price && <small className="form-error">{errors.price}</small>}
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          {errors.description && (
            <small className="form-error">{errors.description}</small>
          )}
        </label>

        <label className="form-field">
          <span>Stock</span>
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
          />
          {errors.stock && <small className="form-error">{errors.stock}</small>}
        </label>

        <label className="form-field">
          <span>Category</span>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {merchCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <small className="form-error">{errors.category}</small>
          )}
        </label>

        <div className="form-field upload-field">
          <span>Product Image</span>
          <input
            className="file-input"
            id="product-image"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          <label
            className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
            htmlFor="product-image"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <span className="upload-icon">Upload</span>
            <span className="upload-title">
              {image ? "Replace product image" : "Choose your product image"}
            </span>
            <span className="upload-subtitle">
              {image
                ? "Click here to browse and replace the current image."
                : "Drag is optional. Click here to browse for an image."}
            </span>
            <span className="upload-meta">JPG, PNG or WEBP</span>
          </label>
          {image ? (
            <p className="upload-filename">Selected: {image.name}</p>
          ) : null}
          {errors.image && <small className="form-error">{errors.image}</small>}
        </div>

        <button className="primary-button form-submit" type="submit">
          Add Merch
        </button>
      </form>
    </section>
  );
}

export default AddMerch;
