import React from 'react';
import { categoriesData } from '../data/products';

const ProductFilter = ({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  sortBy,
  setSortBy,
  resetFilters
}) => {
  return (
    <div className="staesh-card p-4">
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <h5 className="fw-bold mb-0 text-dark">
          <i className="bi bi-funnel text-primary me-2"></i>Filters
        </h5>
        <button
          className="btn btn-sm text-primary p-0 text-decoration-none fw-semibold"
          onClick={resetFilters}
        >
          Reset All
        </button>
      </div>

      {/* Sort By Dropdown */}
      <div className="mb-4">
        <label className="fw-bold small text-dark mb-2 d-block">Sort By</label>
        <select
          className="form-select form-select-sm border-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="popularity">Popularity / Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Customer Rating</option>
          <option value="newest">New Arrivals</option>
        </select>
      </div>

      {/* Categories Filter */}
      <div className="mb-4">
        <label className="fw-bold small text-dark mb-2 d-block">Categories</label>
        <div className="d-flex flex-column gap-2">
          <button
            className={`btn btn-sm text-start py-1 px-2 border-0 rounded ${
              selectedCategory === 'All'
                ? 'bg-primary text-white fw-bold'
                : 'text-dark hover-bg-light'
            }`}
            onClick={() => setSelectedCategory('All')}
          >
            All Categories
          </button>
          {categoriesData.map((cat) => (
            <button
              key={cat.id}
              className={`btn btn-sm text-start py-1 px-2 border-0 rounded d-flex justify-content-between align-items-center ${
                selectedCategory === cat.name
                  ? 'bg-primary text-white fw-bold'
                  : 'text-secondary hover-bg-light'
              }`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              <span>{cat.name}</span>
              <span className={`badge rounded-pill ${selectedCategory === cat.name ? 'bg-light text-primary' : 'bg-light text-muted'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="fw-bold small text-dark mb-0">Max Price</label>
          <span className="fw-bold text-primary small">₹{priceRange.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          className="form-range"
          min="500"
          max="5000"
          step="100"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
        />
        <div className="d-flex justify-content-between text-muted extra-small">
          <span>₹500</span>
          <span>₹5,000+</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="fw-bold small text-dark mb-2 d-block">Minimum Rating</label>
        <div className="d-flex flex-column gap-2">
          {[4.5, 4.0, 3.5].map((stars) => (
            <button
              key={stars}
              className={`btn btn-sm border-0 text-start px-2 py-1 rounded d-flex align-items-center justify-content-between ${
                minRating === stars ? 'bg-primary text-white fw-bold' : 'text-dark hover-bg-light'
              }`}
              onClick={() => setMinRating(minRating === stars ? 0 : stars)}
            >
              <span className="d-flex align-items-center gap-1">
                <i className="bi bi-star-fill text-warning"></i> {stars} & above
              </span>
              {minRating === stars && <i className="bi bi-check-lg"></i>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
