import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import Rating from './Rating';

const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useShop();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedColor(quickViewProduct.colors ? quickViewProduct.colors[0] : '');
      setSelectedSize(quickViewProduct.sizes ? quickViewProduct.sizes[0] : '');
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isSaved = isInWishlist(quickViewProduct.id);

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1080 }}
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
          <div className="modal-body p-0">
            <div className="row g-0">
              {/* Product Image */}
              <div className="col-md-6 bg-light d-flex align-items-center justify-content-center position-relative">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="w-100 h-100 object-fit-cover"
                  style={{ maxHeight: '420px' }}
                />
                {quickViewProduct.discount > 0 && (
                  <span className="position-absolute top-0 start-0 m-3 badge-discount">
                    -{quickViewProduct.discount}% OFF
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="col-md-6 p-4 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="badge-category">{quickViewProduct.category}</span>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setQuickViewProduct(null)}
                    aria-label="Close"
                  ></button>
                </div>

                <h5 className="fw-bold mb-2 text-dark">{quickViewProduct.name}</h5>

                <div className="mb-3">
                  <Rating rating={quickViewProduct.rating} reviews={quickViewProduct.reviews} />
                </div>

                <div className="d-flex align-items-baseline gap-2 mb-3">
                  <span className="fs-4 fw-bold text-dark">
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                  </span>
                  {quickViewProduct.originalPrice && (
                    <span className="text-muted text-decoration-line-through small">
                      ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-muted small mb-3">
                  {quickViewProduct.description}
                </p>

                {/* Color Selector */}
                {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                  <div className="mb-3">
                    <label className="fw-bold small text-dark d-block mb-1">Color</label>
                    <div className="d-flex gap-2">
                      {quickViewProduct.colors.map((color) => (
                        <button
                          key={color}
                          className={`btn p-0 rounded-circle border border-2 ${
                            selectedColor === color ? 'border-primary scale-110' : 'border-light'
                          }`}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: color.includes(' ') ? '#2D2D2D' : color
                          }}
                          onClick={() => setSelectedColor(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                  <div className="mb-3">
                    <label className="fw-bold small text-dark d-block mb-1">Size</label>
                    <div className="d-flex flex-wrap gap-2">
                      {quickViewProduct.sizes.map((size) => (
                        <button
                          key={size}
                          className={`btn btn-sm ${
                            selectedSize === size
                              ? 'btn-primary text-white fw-bold'
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

                {/* Quantity Controls */}
                <div className="d-flex align-items-center gap-3 mb-4 mt-auto">
                  <div className="d-inline-flex align-items-center border border-2 rounded-pill px-2 py-1 bg-light">
                    <button
                      className="btn btn-sm btn-link text-dark p-0 px-2 text-decoration-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <i className="bi bi-dash-lg"></i>
                    </button>
                    <span className="px-3 fw-bold small">{quantity}</span>
                    <button
                      className="btn btn-sm btn-link text-dark p-0 px-2 text-decoration-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>

                  <button
                    className={`btn btn-outline-danger rounded-circle p-2 d-flex align-items-center justify-content-center ${isSaved ? 'active bg-danger text-white' : ''}`}
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => toggleWishlist(quickViewProduct)}
                  >
                    <i className={`bi ${isSaved ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  className="btn btn-primary-custom w-100 justify-content-center"
                  onClick={() => {
                    addToCart(quickViewProduct, quantity, selectedColor, selectedSize);
                    setQuickViewProduct(null);
                  }}
                >
                  <i className="bi bi-bag-plus"></i> Add to Cart • ₹{(quickViewProduct.price * quantity).toLocaleString('en-IN')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
