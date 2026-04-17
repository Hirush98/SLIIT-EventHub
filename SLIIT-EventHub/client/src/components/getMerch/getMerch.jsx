import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Merch from "../Merch/Merch.jsx";
import Button from "../ui/Button";
import "./getMerch.css";

const URL = "http://localhost:4000/merch";

const fetchHandler = async () =>
  axios.get(URL, {
    headers: { "Cache-Control": "no-cache" },
    params: { ts: Date.now() },
  }).then((res) => res.data);

function GetMerch() {
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.role === "admin";
  const [merch, setMerch] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  const loadMerch = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchHandler();
      setMerch(data.merch || []);
    } catch {
      setError("Failed to load merchandise. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMerch();

    const handleFocus = () => {
      loadMerch();
    };
    const handleMerchStockUpdate = () => {
      loadMerch();
    };
    const handleStorage = (event) => {
      if (event.key === "merch-stock-updated-at") {
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
  }, [loadMerch]);

  const categories = useMemo(() => {
    const allCategories = merch
      .map((item) => item.category)
      .filter(Boolean);

    return ["All", ...new Set(allCategories)];
  }, [merch]);

  const filteredMerch = merch.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || (
      item.name?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
    const matchesCategory = category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setCategory("All");
  };

  const hasActiveFilters = searchTerm || category !== "All";

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Campus Merchandise</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isLoading ? "Loading..." : `${filteredMerch.length} item${filteredMerch.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
        {isAdmin ? (
          <Link to="/addmerch">
            <Button variant="primary" size="md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Merch
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search merchandise by name, description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((itemCategory) => (
            <button
              key={itemCategory}
              onClick={() => setCategory(itemCategory)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                category === itemCategory
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {itemCategory}
            </button>
          ))}
        </div>

        {hasActiveFilters ? (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 underline transition-colors hover:text-gray-800"
          >
            Clear all filters
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white animate-pulse">
              <div className="h-44 bg-gray-200" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && filteredMerch.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V7a2 2 0 00-2-2h-3V4a2 2 0 10-4 0v1H8a2 2 0 00-2 2v6m14 0v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5m14 0H6" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-gray-700">No merchandise found</h3>
          <p className="max-w-xs text-center text-sm text-gray-400">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "No merchandise has been added yet. Check back soon."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-gray-600 underline transition-colors hover:text-gray-800"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !error && filteredMerch.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMerch.map((item) => (
            <Merch key={item._id || item.name} merchandise={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default GetMerch;
