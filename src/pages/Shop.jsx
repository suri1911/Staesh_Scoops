import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductFilter from '../components/ProductFilter';
import { useShop } from '../context/ShopContext';
import Rating from '../components/Rating';

const Shop = () => {
  const { products, searchQuery, setSearchQuery, addToCart } = useShop();
  const location = useLocation();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(6000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');
    const filterParam = params.get('filter');

    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchQuery(searchParam);
    if (filterParam === 'deals') setSortBy('price-low');
    if (filterParam === 'new') setSortBy('newest');
  }, [location.search, setSearchQuery]);

  // Reset Filters
  const resetFilters = () => {
    setSelectedCategory('All');
    setPriceRange(6000);
    setMinRating(0);
    setSortBy('popularity');
    setSearchQuery('');
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search term
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDesc) return false;
      }

      // Category
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Price Range
      if (p.price > priceRange) {
        return false;
      }

      // Rating
      if (minRating > 0 && p.rating < minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, priceRange, minRating, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, minRating, sortBy, searchQuery]);

  return (
    <div className="shop-page py-4">
      <div className="container">
        {/* Header Breadcrumb & Title */}
        <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
            <div>
              <h2 className="fw-extrabold text-dark mb-1 font-heading">Shop Catalog</h2>
              <p className="text-muted small mb-0">
                Showing {filteredProducts.length} results {selectedCategory !== 'All' && `in "${selectedCategory}"`}
              </p>
            </div>

            {/* Search Input Bar inside shop header */}
            <div className="mt-3 mt-md-0" style={{ minWidth: '280px' }}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="btn btn-light border" onClick={() => setSearchQuery('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== 'All' || priceRange < 6000 || minRating > 0 || searchQuery) && (
            <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top">
              <span className="text-muted extra-small fw-bold">Active Filters:</span>

              {selectedCategory !== 'All' && (
                <span className="filter-pill">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')}>×</button>
                </span>
              )}

              {priceRange < 6000 && (
                <span className="filter-pill">
                  Under ₹{priceRange.toLocaleString('en-IN')}
                  <button onClick={() => setPriceRange(6000)}>×</button>
                </span>
              )}

              {minRating > 0 && (
                <span className="filter-pill">
                  {minRating}+ Stars
                  <button onClick={() => setMinRating(0)}>×</button>
                </span>
              )}

              {searchQuery && (
                <span className="filter-pill">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>×</button>
                </span>
              )}

              <button className="btn btn-link text-danger extra-small p-0 ms-2 text-decoration-none fw-bold" onClick={resetFilters}>
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="row g-4">
          {/* Sidebar Filter Component */}
          <div className="col-lg-3">
            <ProductFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
              sortBy={sortBy}
              setSortBy={setSortBy}
              resetFilters={resetFilters}
            />
          </div>

          {/* Product Grid Area */}
          <div className="col-lg-9">
            {/* Top Toolbar: View Mode & Results Count */}
            <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded-4 shadow-sm border mb-4">
              <span className="text-muted small">
                Showing <strong>{paginatedProducts.length}</strong> of <strong>{filteredProducts.length}</strong> Products
              </span>

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small d-none d-sm-inline">View:</span>
                <button
                  className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <i className="bi bi-grid-3x3-gap-fill"></i>
                </button>
                <button
                  className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="staesh-card text-center p-5">
                <i className="bi bi-search fs-1 text-muted d-block mb-3"></i>
                <h4 className="fw-bold text-dark">No Products Found</h4>
                <p className="text-muted">Try clearing filters or adjusting your search term.</p>
                <button className="btn btn-primary-custom mt-2" onClick={resetFilters}>
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Layout */
              <div className="row g-4">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="col-12 col-sm-6 col-md-4">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              /* List Layout */
              <div className="d-flex flex-column gap-3">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="staesh-card p-3">
                    <div className="row align-items-center g-3">
                      <div className="col-4 col-md-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-100 rounded-3 object-fit-cover"
                          style={{ height: '140px' }}
                        />
                      </div>
                      <div className="col-8 col-md-6">
                        <span className="badge-category mb-1">{product.category}</span>
                        <h5 className="fw-bold text-dark mb-1">{product.name}</h5>
                        <Rating rating={product.rating} reviews={product.reviews} />
                        <p className="text-muted small mt-2 d-none d-md-block line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <div className="col-12 col-md-3 text-md-end border-top border-md-0 pt-2 pt-md-0">
                        <div className="fs-4 fw-bold text-dark mb-2">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        <button
                          className="btn btn-primary-custom w-100 justify-content-center btn-sm"
                          onClick={() => addToCart(product, 1)}
                        >
                          <i className="bi bi-bag-plus"></i> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav className="mt-4 d-flex justify-content-center">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(c => c - 1)}>
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(c => c + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
