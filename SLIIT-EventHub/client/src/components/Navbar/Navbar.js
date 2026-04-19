import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import sliitLogo from "./logo.png";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-brand">
          <img className="nav-brand-image" src={sliitLogo} alt="SLIIT Logo" />
          <Link to="/" className="logo">
            SLIIT EMS
          </Link>
        </div>

        {/* Links */}
        <ul className="nav-menu">
          <li><NavLink to="/mainhome">Home</NavLink></li>
          <li><NavLink to="/merch">Merch</NavLink></li>
          <li><NavLink to="/addmerch">Add Merch</NavLink></li>
          <li><NavLink to="/cart">Cart</NavLink></li>
        </ul>

        {/* Right side */}
        <div className="nav-right">
          <Link to="/cart" className="cart" aria-label="Open cart page">
            <span className="cart-icon" aria-hidden="true">🛒</span>
            <span>Cart</span>
            <span className="cart-count">0</span>
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
