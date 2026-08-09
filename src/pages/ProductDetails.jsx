import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import Rating from '../components/Rating';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist } = useShop();

  const product = products.find((p) => p.id === Number(id)) || products[0];
  const isSaved = isInWishlist(product.id);

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : '');
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Related Products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    navigate('/checkout');
  };

  return (
    <div className="product-details-page py-5">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/shop" className="text-decoration-none text-muted">Shop</Link></li>
            <li className="breadcrumb-item"><Link to={`/shop?category=${product.category}`} className="text-decoration-none text-muted">{product.category}</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        {/* Main Product Details Card */}
        <div className="staesh-card p-4 p-md-5 mb-5">
          <div className="row g-5">
            {/* Left: Gallery & Zoom Preview */}
            <div className="col-lg-6">
              <div className="position-relative rounded-4 overflow-hidden bg-light mb-3 border shadow-sm">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-100 h-100 object-fit-cover transition-transform"
                  style={{ maxHeight: '480px', minHeight: '380px' }}
                />
                {product.discount > 0 && (
                  <span className="position-absolute top-0 start-0 m-3 badge-discount fs-6">
                    -{product.discount}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              <div className="d-flex gap-3">
                {[product.image, ...Array(3).fill(product.image)].map((img, index) => (
                  <button
                    key={index}
                    className={`btn p-0 border-2 rounded-3 overflow-hidden ${
                      selectedImage === img ? 'border-primary shadow' : 'border-light'
                    }`}
                    style={{ width: '80px', height: '80px' }}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt="thumbnail" className="w-100 h-100 object-fit-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Info & Controls */}
            <div className="col-lg-6 d-flex flex-column">
              <div className="mb-2">
                <span className="badge-category">{product.category}</span>
                <span className="text-success small ms-3 fw-bold">
                  <i className="bi bi-check-circle-fill me-1"></i> In Stock ({product.stock} units)
                </span>
              </div>

              <h2 className="fw-extrabold text-dark mb-3 font-heading">{product.name}</h2>

              <div className="d-flex align-items-center gap-3 mb-3">
                <Rating rating={product.rating} reviews={product.reviews} size="lg" />
                <span className="text-muted small border-start ps-3">SKU: ST-{product.id}092</span>
              </div>

              {/* Pricing */}
              <div className="d-flex align-items-baseline gap-3 mb-4 p-3 bg-light rounded-3 border">
                <span className="display-6 fw-extrabold text-dark font-heading">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="fs-5 text-muted text-decoration-line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="badge bg-danger ms-auto">Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}</span>
                )}
              </div>

              <p className="text-secondary mb-4">{product.description}</p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-4">
                  <label className="fw-bold text-dark mb-2 d-block">
                    Select Color: <span className="text-primary">{selectedColor}</span>
                  </label>
                  <div className="d-flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        className={`btn p-1 rounded-circle border-2 ${
                          selectedColor === color ? 'border-primary' : 'border-secondary-subtle'
                        }`}
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                      >
                        <div
                          className="w-100 h-100 rounded-circle"
                          style={{ backgroundColor: color.includes(' ') ? '#2D2D2D' : color }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <label className="fw-bold text-dark mb-2 d-block">
                    Select Size: <span className="text-primary">{selectedSize}</span>
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        className={`btn px-3 py-2 ${
                          selectedSize === size
                            ? 'btn-primary text-white fw-bold shadow-sm'
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Controls & Action Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-3 mt-auto pt-3">
                <div className="d-inline-flex align-items-center border border-2 rounded-pill px-3 py-2 bg-light">
                  <button
                    className="btn btn-sm btn-link text-dark p-0 px-2 text-decoration-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <i className="bi bi-dash-lg fs-5"></i>
                  </button>
                  <span className="px-3 fw-bold fs-5">{quantity}</span>
                  <button
                    className="btn btn-sm btn-link text-dark p-0 px-2 text-decoration-none"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <i className="bi bi-plus-lg fs-5"></i>
                  </button>
                </div>

                <button
                  className="btn btn-primary-custom btn-lg flex-grow-1 justify-content-center"
                  onClick={() => addToCart(product, quantity, selectedColor, selectedSize)}
                >
                  <i className="bi bi-bag-plus fs-5"></i> Add to Cart
                </button>

                <button
                  className="btn btn-dark btn-lg px-4 font-heading rounded-pill"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>

                <button
                  className={`btn btn-outline-danger rounded-circle p-3 d-flex align-items-center justify-content-center ${
                    isSaved ? 'bg-danger text-white' : ''
                  }`}
                  style={{ width: '52px', height: '52px' }}
                  onClick={() => toggleWishlist(product)}
                  title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <i className={`bi ${isSaved ? 'bi-heart-fill' : 'bi-heart'} fs-5`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Product Details Section */}
        <div className="staesh-card p-4 p-md-5 mb-5">
          <ul className="nav nav-tabs nav-justified border-bottom-2 mb-4">
            <li className="nav-item">
              <button
                className={`nav-link fw-bold py-3 fs-5 ${activeTab === 'description' ? 'active text-primary border-primary border-bottom-3' : 'text-muted'}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold py-3 fs-5 ${activeTab === 'specs' ? 'active text-primary border-primary border-bottom-3' : 'text-muted'}`}
                onClick={() => setActiveTab('specs')}
              >
                Specifications
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold py-3 fs-5 ${activeTab === 'reviews' ? 'active text-primary border-primary border-bottom-3' : 'text-muted'}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({product.reviews})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold py-3 fs-5 ${activeTab === 'shipping' ? 'active text-primary border-primary border-bottom-3' : 'text-muted'}`}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </li>
          </ul>

          <div className="tab-content pt-2">
            {activeTab === 'description' && (
              <div>
                <h5 className="fw-bold mb-3 text-dark">Product Highlights & Overview</h5>
                <p className="text-secondary leading-relaxed">{product.description}</p>
                <p className="text-secondary leading-relaxed">
                  Crafted using high-durability premium materials designed specifically for modern daily usage. Every piece undergoes rigorous quality control standards before dispatch.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h5 className="fw-bold mb-3 text-dark">Technical Specifications</h5>
                {product.specs ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle">
                      <tbody>
                        {Object.entries(product.specs).map(([key, val]) => (
                          <tr key={key}>
                            <td className="fw-bold bg-light" style={{ width: '30%' }}>{key}</td>
                            <td>{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">Standard specifications apply.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h5 className="fw-bold mb-0 text-dark">Customer Feedback</h5>
                  <button className="btn btn-outline-primary btn-sm rounded-pill fw-bold">
                    Write a Review
                  </button>
                </div>
                <div className="d-flex align-items-center gap-4 bg-light p-4 rounded-4 mb-4">
                  <div className="text-center">
                    <h1 className="display-4 fw-extrabold text-dark mb-0">{product.rating}</h1>
                    <Rating rating={product.rating} showCount={false} size="lg" />
                    <span className="text-muted extra-small d-block mt-1">based on {product.reviews} reviews</span>
                  </div>
                  <div className="flex-grow-1 border-start ps-4">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="small text-muted" style={{ width: '40px' }}>5 ★</span>
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div className="progress-bar bg-warning" style={{ width: '85%' }}></div>
                      </div>
                      <span className="small text-muted">85%</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="small text-muted" style={{ width: '40px' }}>4 ★</span>
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div className="progress-bar bg-warning" style={{ width: '12%' }}></div>
                      </div>
                      <span className="small text-muted">12%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h5 className="fw-bold mb-3 text-dark">Shipping & Easy Returns</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item bg-transparent ps-0">
                    <strong>🚚 Free Express Delivery:</strong> Orders over ₹1,999 qualify for free express shipping (delivered in 2–4 business days).
                  </li>
                  <li className="list-group-item bg-transparent ps-0">
                    <strong>↩ 7-Day Hassle-Free Returns:</strong> Return or exchange eligible items within 7 days of delivery.
                  </li>
                  <li className="list-group-item bg-transparent ps-0">
                    <strong>🔒 Safe Packaging:</strong> Tamper-proof sanitized packaging for guaranteed product safety.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="section-title mb-4">You May Also Like</h3>
            <div className="row g-4">
              {relatedProducts.map((relProduct) => (
                <div key={relProduct.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <ProductCard product={relProduct} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
