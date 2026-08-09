import React from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { useShop } from '../context/ShopContext';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useShop();
  const isSaved = isInWishlist(product.id);

  return (
    <div className="staesh-card h-100 d-flex flex-column">
      <div className="product-img-container">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="position-absolute top-0 start-0 m-3 badge-discount z-2">
            -{product.discount}% OFF
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          className={`wishlist-heart-btn ${isSaved ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
          aria-label="Wishlist"
        >
          <i className={`bi ${isSaved ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>

        {/* Main Product Image */}
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
      </div>

      {/* Card Content */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="badge-category">{product.category}</span>
          {product.stock <= 5 && (
            <span className="text-danger extra-small fw-bold">Only {product.stock} left!</span>
          )}
        </div>

        <h6 className="fw-bold mb-2 text-truncate" title={product.name}>
          <Link to={`/product/${product.id}`} className="text-decoration-none text-dark hover-orange">
            {product.name}
          </Link>
        </h6>

        <div className="mb-2">
          <Rating rating={product.rating} reviews={product.reviews} />
        </div>

        {/* Price Section */}
        <div className="d-flex align-items-baseline gap-2 mb-3 mt-auto">
          <span className="fs-5 fw-bold text-dark">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-muted text-decoration-line-through small">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary-custom w-100 justify-content-center btn-sm"
            onClick={() => addToCart(product, 1)}
          >
            <i className="bi bi-bag-plus"></i> Add to Cart
          </button>
          <button
            className="btn btn-outline-secondary rounded-circle btn-sm p-2 d-flex align-items-center justify-content-center"
            style={{ width: '38px', height: '38px', flexShrink: 0 }}
            onClick={() => setQuickViewProduct(product)}
            title="Quick View"
          >
            <i className="bi bi-eye"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
