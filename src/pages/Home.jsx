import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { categoriesData, reviewsData } from '../data/products';
import { useShop } from '../context/ShopContext';

const Home = () => {
  const { products, showToast } = useShop();

  // Flash Deals Countdown Timer State (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 35 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
      showToast('Thank you for subscribing to Staesh_Scoops Women\'s Club!', 'bi-envelope-check-fill');
      setNewsletterEmail('');
    }
  };

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const flashDealsProducts = products.filter(p => p.isFlashDeal).slice(0, 4);
  const newArrivalsProducts = products.filter(p => p.isNewArrival).slice(0, 4);

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge-category mb-3">✨ #1 Women's Accessories Destination</span>
              <h1 className="display-4 fw-extrabold text-dark mb-3 font-heading">
                Elevate Your Everyday <br />
                <span className="text-primary">Women's Accessories</span>
              </h1>
              <p className="lead text-muted mb-4">
                Shop curated 18K gold-plated jewelry, handcrafted handbags, polarized sunglasses, silk scarves & rose gold timepieces. Discover luxury without compromise at <strong>Staesh_Scoops</strong>.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/shop" className="btn btn-primary-custom btn-lg">
                  Shop Accessories <i className="bi bi-arrow-right"></i>
                </Link>
                <Link to="/shop?filter=categories" className="btn btn-outline-custom btn-lg">
                  Explore Collections
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="d-flex gap-4 mt-5 pt-3 border-top border-warning border-opacity-50">
                <div>
                  <h4 className="fw-bold mb-0 text-dark font-heading">15k+</h4>
                  <span className="text-muted small">Stylish Women</span>
                </div>
                <div className="border-start ps-4">
                  <h4 className="fw-bold mb-0 text-dark font-heading">300+</h4>
                  <span className="text-muted small">Trendy Accessories</span>
                </div>
                <div className="border-start ps-4">
                  <h4 className="fw-bold mb-0 text-dark font-heading">4.9 ★</h4>
                  <span className="text-muted small">Customer Rating</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="col-lg-6 text-center position-relative">
              <div className="position-relative d-inline-block">
                <img
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
                  alt="Staesh_Scoops Women's Jewelry & Accessories"
                  className="img-fluid rounded-4 shadow-lg animated-float"
                  style={{ maxHeight: '480px', objectFit: 'cover' }}
                />
                <div
                  className="position-absolute bottom-0 start-0 m-4 bg-white p-3 rounded-4 shadow-lg text-start d-flex align-items-center gap-3 border border-warning"
                  style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.95)' }}
                >
                  <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                    <i className="bi bi-gem fs-5"></i>
                  </div>
                  <div>
                    <span className="d-block fw-bold text-dark small">Tarnish-Free Gold Jewelry</span>
                    <span className="text-primary fw-extrabold extra-small">Up to 35% OFF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Shop Accessories By Category</h2>
            <p className="section-subtitle">Discover handcrafted jewelry, luxury handbags, hair accessories & scarves</p>
          </div>
          <div className="row g-4">
            {categoriesData.map((category) => (
              <div key={category.id} className="col-6 col-md-4 col-lg-3">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
            <div>
              <h2 className="section-title mb-1">Featured Women's Accessories</h2>
              <p className="section-subtitle mb-0">Best-selling statement jewelry, bags, and timepieces</p>
            </div>
            <Link to="/shop" className="btn btn-outline-custom mt-3 mt-md-0">
              View All Accessories <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="row g-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FLASH DEALS SECTION WITH LIVE COUNTDOWN TIMER */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)', color: 'white' }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 pb-3 border-bottom border-secondary">
            <div>
              <span className="badge bg-warning text-dark font-heading fw-bold mb-2">LIMITED TIME ACCESSORY SALE</span>
              <h2 className="section-title text-white mb-1">🔥 Flash Deals</h2>
              <p className="text-secondary mb-0">Grab top trending handbags & jewelry before time runs out!</p>
            </div>

            {/* Timer Counter Display */}
            <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
              <span className="text-secondary me-2 fw-semibold">Ends In:</span>
              <div className="timer-box">{String(timeLeft.hours).padStart(2, '0')}h</div>
              <span className="fs-4 text-warning fw-bold">:</span>
              <div className="timer-box">{String(timeLeft.minutes).padStart(2, '0')}m</div>
              <span className="fs-4 text-warning fw-bold">:</span>
              <div className="timer-box text-warning">{String(timeLeft.seconds).padStart(2, '0')}s</div>
            </div>
          </div>

          <div className="row g-4">
            {flashDealsProducts.map((product) => (
              <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
            <div>
              <h2 className="section-title mb-1">✨ New Accessories Drops</h2>
              <p className="section-subtitle mb-0">Fresh seasonal additions curated for your wardrobe</p>
            </div>
            <Link to="/shop?filter=new" className="btn btn-outline-custom mt-3 mt-md-0">
              Explore New Drops <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="row g-4">
            {newArrivalsProducts.map((product) => (
              <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROMOTIONAL BANNER */}
      <section className="container py-4">
        <div
          className="rounded-4 overflow-hidden p-5 text-white position-relative shadow-lg"
          style={{
            background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=1200&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="col-md-8 col-lg-6 my-4">
            <span className="badge bg-primary text-white mb-3 px-3 py-2 fs-6">LUXURY ACCESSORIES EDIT 2026</span>
            <h2 className="display-4 fw-extrabold mb-3 font-heading">Up to 35% OFF</h2>
            <p className="fs-5 mb-4 text-light">
              Elevate your outfits with 18K gold plated jewelry, silk printed scarves, and chic leather totes.
            </p>
            <Link to="/shop" className="btn btn-primary-custom btn-lg">
              Shop Luxury Collection <i className="bi bi-gem"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE STAESH_SCOOPS */}
      <section className="py-5 bg-white mt-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-3 col-6">
              <div className="feature-box text-center h-100">
                <div className="feature-icon mx-auto">
                  <i className="bi bi-gem"></i>
                </div>
                <h6 className="fw-bold mb-1">Tarnish-Free Gold</h6>
                <p className="text-muted small mb-0">18K gold-plated stainless steel built to last.</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="feature-box text-center h-100">
                <div className="feature-icon mx-auto">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h6 className="fw-bold mb-1">100% Authentic</h6>
                <p className="text-muted small mb-0">Hypoallergenic & nickel-free certified materials.</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="feature-box text-center h-100">
                <div className="feature-icon mx-auto">
                  <i className="bi bi-box-seam"></i>
                </div>
                <h6 className="fw-bold mb-1">Luxury Gift Box</h6>
                <p className="text-muted small mb-0">Every item arrives packaged in a velvet pouch.</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="feature-box text-center h-100">
                <div className="feature-icon mx-auto">
                  <i className="bi bi-headset"></i>
                </div>
                <h6 className="fw-bold mb-1">24/7 Support</h6>
                <p className="text-muted small mb-0">Dedicated fashion stylists ready to assist anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Loved By Women Everywhere</h2>
            <p className="section-subtitle">Real experiences from verified Staesh_Scoops shoppers</p>
          </div>
          <div className="row g-4">
            {reviewsData.map((review) => (
              <div key={review.id} className="col-md-4">
                <div className="testimonial-card h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="text-warning mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill me-1"></i>
                      ))}
                    </div>
                    <p className="text-dark fst-italic mb-4">"{review.comment}"</p>
                  </div>
                  <div className="d-flex align-items-center gap-3 border-top pt-3">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="rounded-circle object-fit-cover"
                      style={{ width: '45px', height: '45px' }}
                    />
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">{review.name}</h6>
                      <span className="text-primary extra-small fw-semibold">{review.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER SECTION */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <span className="fs-1 d-block mb-2">💎</span>
              <h2 className="fw-extrabold text-white mb-3 font-heading">Join The Staesh VIP Club!</h2>
              <p className="lead mb-4 text-light">
                Subscribe to get VIP access to new jewelry drops, styling tips, and ₹500 off your first order!
              </p>
              <form onSubmit={handleNewsletterSubmit} className="d-flex flex-column flex-sm-row gap-2 justify-content-center max-w-lg mx-auto">
                <input
                  type="email"
                  className="form-control form-control-lg rounded-pill border-0 px-4"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-dark btn-lg rounded-pill px-4 fw-bold font-heading">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
