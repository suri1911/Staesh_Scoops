import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { getCartCount, wishlist, searchQuery, setSearchQuery } = useShop();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchModal(false);
    }
  };

  return (
    <>
      <header className="sticky-navbar">
        {/* Top Promo Announcement Bar
        <div className="bg-dark text-white py-1 px-3 text-center extra-small font-heading" style={{ letterSpacing: '0.5px' }}>
          ✨ FREE EXPRESS SHIPPING ON WOMEN'S ACCESSORIES ORDERS ABOVE ₹1,999! CODE: <span className="text-warning fw-bold">STAESH500</span>
        </div> */}

        <nav className="navbar navbar-expand-lg py-3">
          <div className="container">
            {/* Brand Logo */}
            <Link to="/" className="navbar-brand fw-extrabold fs-3 d-flex align-items-center gap-2">
            <span> <img src="../LOGO.png" alt="" className='logoda'/> </span>

              <span className="font-heading text-dark">
                Staesh<span className="text-primary">_Scoops</span>
              </span>
            </Link>

            {/* Mobile Actions & Toggle */}
            <div className="d-flex align-items-center gap-2 d-lg-none">
              <button
                className="btn btn-link text-dark p-1 text-decoration-none"
                onClick={() => setShowSearchModal(true)}
              >
                <i className="bi bi-search fs-5"></i>
              </button>
              <Link to="/cart" className="btn btn-link text-dark p-1 position-relative text-decoration-none">
                <i className="bi bi-bag fs-5"></i>
                {getCartCount() > 0 && <span className="cart-badge-count">{getCartCount()}</span>}
              </Link>
              <button
                className="navbar-toggler border-0 p-1 shadow-none"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#staeshNavbar"
              >
                <i className="bi bi-list fs-2 text-dark"></i>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="collapse navbar-collapse" id="staeshNavbar">
              <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold text-center gap-lg-3">
                <li className="nav-item">
                  <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'text-primary fw-bold' : 'text-dark'}`}>
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'text-primary fw-bold' : 'text-dark'}`}>
                    Shop Accessories
                  </NavLink>
                </li>
                {/* <li className="nav-item">
                  <NavLink to="/shop?filter=categories" className="nav-link text-dark">
                    Categories
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/shop?filter=deals" className="nav-link text-dark">
                    Deals 🔥
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/shop?filter=new" className="nav-link text-dark">
                    New Drops ✨
                  </NavLink>
                </li> */}
              </ul>

              {/* Desktop Icons */}
              <div className="d-none d-lg-flex align-items-center gap-3">
                {/* Search trigger */}
                <button
                  className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                  onClick={() => setShowSearchModal(true)}
                  title="Search Women's Accessories"
                >
                  <i className="bi bi-search"></i>
                </button>

                {/* Track Order Icon */}
                <Link
                  to="/track-order"
                  className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center text-decoration-none"
                  style={{ width: '40px', height: '40px' }}
                  title="Track Order"
                >
                  <i className="bi bi-geo-alt text-dark"></i>
                </Link>

                {/* Wishlist Icon */}
                <Link
                  to="/wishlist"
                  className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center position-relative text-decoration-none"
                  style={{ width: '40px', height: '40px' }}
                  title="Wishlist"
                >
                  <i className="bi bi-heart text-dark"></i>
                  {wishlist.length > 0 && (
                    <span className="cart-badge-count bg-danger">{wishlist.length}</span>
                  )}
                </Link>

                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="btn btn-primary-custom px-3 py-2 text-decoration-none position-relative"
                >
                  <i className="bi bi-bag-check fs-6"></i>
                  <span>Cart</span>
                  {getCartCount() > 0 && (
                    <span className="badge bg-white text-primary rounded-pill ms-1 fw-bold">
                      {getCartCount()}
                    </span>
                  )}
                </Link>

                {/* Account / User Icon */}
                <Link
                  to="/login"
                  className="btn btn-outline-dark rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                  title="My Account"
                >
                  <i className="bi bi-person"></i>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      {showSearchModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)', zIndex: 1090 }}
          onClick={() => setShowSearchModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0 text-dark">Search Women's Accessories</h5>
                <button className="btn-close" onClick={() => setShowSearchModal(false)}></button>
              </div>

              <SearchBar
                placeholder="Search for hair clips, scrunchies, stationery, Korean clips..."
                onSearch={(query) => {
                  if (query.trim()) {
                    navigate(`/shop?search=${encodeURIComponent(query)}`);
                    setShowSearchModal(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
