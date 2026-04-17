import React from "react";
import { Link } from "react-router-dom";
import "./Merch.css";
 //this page is for showing the details of the merchandise and also for editing and deleting the merchandise
 //මේක තමයි විස්තර ටික පෙන්න බොක්ස් එක තියෙන්නෙ මේක එඩිට් කරොත් ඔක්කොම තොරතුරු එඩිට් කරගන්න පුලුවන් වෙනස් කරන්න පුලුවන් delete කරොත් ඒක ඩිලීට් කරගන්න පුලුවන්
 
function Merch(props) {
  const { _id, name, price, stock, category, image } = props.merchandise;
  const imageUrl = image ? `http://localhost:4000${image}` : "";

  return (
    <article className="merch-card">
      {imageUrl && (
        <img className="merch-card-image" src={imageUrl} alt={name} />
      )}
      <div className="merch-card-body">
        <p className="merch-card-category">{category}</p>
        <h2>{name}</h2>
        <p className="merch-card-price">LKR. {price}</p>
        <p className="merch-card-stock">Only {stock} left!</p>
      </div>
      <Link to={`/merch/${_id}`} className="button-link">
        <button className="primary-button">View Details</button>
      </Link>
    </article>
  );
}

export default Merch;
 
