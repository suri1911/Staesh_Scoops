import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useShop();
  const { product, quantity, selectedColor, selectedSize } = item;
  const lineTotal = product.price * quantity;

  return (
    <div className="staesh-card p-3 mb-3">
      <div className="row align-items-center g-3">
        {/* Product Image */}
        <div className="col-3 col-md-2">
          <div className="rounded overflow-hidden bg-light" style={{ width: '100%', paddingTop: '100%', position: 'relative' }}>
            <img
              src={product.image}
              alt={product.name}
              className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="col-9 col-md-4">
          <span className="badge-category mb-1">{product.category}</span>
          <h6 className="fw-bold mb-1">
            <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
              {product.name}
            </Link>
          </h6>
          <div className="d-flex flex-wrap gap-2 text-muted small">
            {selectedColor && (
              <span className="d-inline-flex align-items-center gap-1">
                Color: <span className="d-inline-block rounded-circle border" style={{ width: '12px', height: '12px', backgroundColor: selectedColor }}></span>
              </span>
            )}
            {selectedSize && <span>Size: <strong>{selectedSize}</strong></span>}
          </div>
          <span className="fw-semibold text-primary d-md-none fs-6 mt-1 d-block">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Price Desktop */}
        <div className="col-md-2 d-none d-md-block text-center">
          <span className="fw-semibold text-dark fs-6">₹{product.price.toLocaleString('en-IN')}</span>
        </div>

        {/* Quantity Controls */}
        <div className="col-7 col-md-3">
          <div className="d-inline-flex align-items-center border border-2 rounded-pill px-2 py-1 bg-light">
            <button
              className="btn btn-sm btn-link text-dark p-0 px-2 text-decoration-none"
              onClick={() => updateQuantity(product.id, selectedColor, selectedSize, -1)}
              disabled={quantity <= 1}
            >
              <i className="bi bi-dash-lg"></i>
            </button>
            <span className="px-3 fw-bold small">{quantity}</span>
            <button
              className="btn btn-sm btn-link text-dark p-0 px-2 text-decoration-none"
              onClick={() => updateQuantity(product.id, selectedColor, selectedSize, 1)}
            >
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>

        {/* Line Total & Remove */}
        <div className="col-5 col-md-1 text-end d-flex align-items-center justify-content-end gap-3">
          <span className="fw-bold text-dark d-none d-md-block">₹{lineTotal.toLocaleString('en-IN')}</span>
          <button
            className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px' }}
            onClick={() => removeFromCart(product.id, selectedColor, selectedSize)}
            title="Remove item"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
