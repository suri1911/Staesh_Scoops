import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-5 border-top border-secondary">
      <div className="container">
        <div className="row g-4 mb-5">
          {/* Brand & About */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 mb-3">
              <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px' }}>
                S
              </span>
              <span className="font-heading fs-3 fw-bold text-white">
                Staesh<span className="text-primary">_Scoops</span>
              </span>
            </Link>
            <p className="text-secondary small pe-lg-4">
              Staesh_Scoops is your premier online destination for luxury women's accessories. Elevate your everyday style with tarnish-free 18K gold jewelry, designer leather totes, polarized sunglasses, silk scarves, and elegant timepieces.
            </p>
            <div className="d-flex gap-3 text-secondary mt-3">
              <a href="#instagram" className="btn btn-outline-light rounded-circle btn-sm p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#facebook" className="btn btn-outline-light rounded-circle btn-sm p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#pinterest" className="btn btn-outline-light rounded-circle btn-sm p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-pinterest"></i>
              </a>
              <a href="#youtube" className="btn btn-outline-light rounded-circle btn-sm p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold font-heading text-warning mb-3">Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 text-secondary small">
              <li><Link to="/" className="text-secondary text-decoration-none hover-white">Home</Link></li>
              <li><Link to="/shop" className="text-secondary text-decoration-none hover-white">Shop Accessories</Link></li>
              <li><Link to="/wishlist" className="text-secondary text-decoration-none hover-white">My Wishlist</Link></li>
              <li><Link to="/cart" className="text-secondary text-decoration-none hover-white">Shopping Cart</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none hover-white">My Account</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="fw-bold font-heading text-warning mb-3">Customer Support</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 text-secondary small">
              <li><a href="#shipping" className="text-secondary text-decoration-none hover-white">Free Express Shipping</a></li>
              <li><a href="#returns" className="text-secondary text-decoration-none hover-white">7-Day Easy Returns</a></li>
              <li><a href="#jewelry-care" className="text-secondary text-decoration-none hover-white">Jewelry Care Guide</a></li>
              <li><a href="#privacy" className="text-secondary text-decoration-none hover-white">Privacy Policy</a></li>
              <li><a href="#faq" className="text-secondary text-decoration-none hover-white">Help & FAQs</a></li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold font-heading text-warning mb-3">Secure Payments</h6>
            <p className="text-secondary small mb-3">
              100% encrypted checkout with Cards, UPI, NetBanking, and Cash on Delivery.
            </p>
            <div className="d-flex flex-wrap gap-2 text-muted">
              <span className="badge bg-secondary p-2"><i className="bi bi-credit-card-fill me-1"></i> Cards</span>
              <span className="badge bg-secondary p-2"><i className="bi bi-phone-fill me-1"></i> UPI / GPay</span>
              <span className="badge bg-secondary p-2"><i className="bi bi-bank me-1"></i> NetBanking</span>
              <span className="badge bg-secondary p-2"><i className="bi bi-cash-stack me-1"></i> COD</span>
            </div>
          </div>
        </div>

        <hr className="border-secondary" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center text-secondary small py-2">
          <span>© 2026 <strong>Staesh_Scoops Women's Accessories</strong>. All Rights Reserved.</span>
          <span>Crafted with ❤️ for stylish women</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
