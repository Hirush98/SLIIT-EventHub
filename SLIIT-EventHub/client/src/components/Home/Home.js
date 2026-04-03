import React from "react";
import "./Home.css";

function Home() {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">SLIIT Event Merchandise Portal</p>
        <h1>Campus merchandise management with a cleaner workflow.</h1>
        <p className="hero-text">
          Add merchandise, review stock, and manage product details in one
          place with a consistent SLIIT-inspired interface.
        </p>
      </div>
      <div className="hero-stat-card">
        <span className="hero-stat-label">Operational Focus</span>
        <strong>Merchandise, stock, and product visibility</strong>
        <p>Built for a clearer admin workflow and faster item management.</p>
      </div>
    </section>
  );
}

export default Home;
