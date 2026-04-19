import axios from "axios";
import React, { useEffect, useState } from "react";
import Merch from "../Merch/Merch.js";
import "./getMerch.css";

const URL = "http://localhost:4000/merch";

const fetchHandler = async () => {
  return axios.get(URL).then((res) => res.data);
};

function GetMerch() {
  const [merch, setMerch] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHandler().then((data) => setMerch(data.merch || []));
  }, []);

  const filteredMerch = merch.filter((item) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      item.name?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  });

  return (
    <section className="page-section">
      <div className="section-heading">
        <p className="eyebrow">SLIIT Merchandise</p>
        <h1>All Merchandise</h1>
      </div>
      <div className="search-bar-wrap">
        <input
          className="search-bar"
          type="text"
          placeholder="Search by product name or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="merch-grid">
        {filteredMerch.map((item) => (
          <div key={item._id || item.name}>
            <Merch merchandise={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default GetMerch;
