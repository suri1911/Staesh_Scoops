import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { cart, getCartSubtotal, getCartOriginalTotal, clearCart, showToast } = useShop();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = getCartSubtotal();
  const originalTotal = getCartOriginalTotal();
  const productSavings = originalTotal - subtotal;
  const deliveryFee = subtotal > 1999 || subtotal === 0 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'STAESH500') {
      setCouponApplied(true);
      setDiscountAmount(500);
      showToast('Coupon STAESH500 applied! Saved ₹500', 'bi-check-circle-fill');
    } else {
      showToast('Invalid coupon code. Try STAESH500', 'bi-exclamation-triangle-fill');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="staesh-card p-5 max-w-md mx-auto">
          <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 text-primary">
            <i className="bi bi-bag-x fs-1"></i>
          </div>
          <h3 className="fw-bold text-dark font-heading mb-2">Your Shopping Cart is Empty</h3>
          <p className="text-muted mb-4">
            Looks like you haven't added any items to your scoop yet!
          </p>
          <Link to="/shop" className="btn btn-primary-custom btn-lg">
            Start Shopping Now <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page py-5">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-extrabold text-dark font-heading mb-1">Your Shopping Cart</h2>
            <p className="text-muted small mb-0">Review your selected items before checkout</p>
          </div>
          <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={clearCart}>
            <i className="bi bi-trash me-1"></i> Clear Cart
          </button>
        </div>

        <div className="row g-4">
          {/* Cart Item List */}
          <div className="col-lg-8">
            {cart.map((item, index) => (
              <CartItem key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`} item={item} />
            ))}

            <div className="d-flex justify-content-between align-items-center mt-4">
              <Link to="/shop" className="btn btn-outline-custom">
                <i className="bi bi-arrow-left"></i> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Cart Order Summary Breakdown Sidebar */}
          <div className="col-lg-4">
            <div className="staesh-card p-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="fw-bold mb-3 border-bottom pb-3 text-dark font-heading">
                Order Summary
              </h5>

              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="mb-4">
                <label className="form-label small fw-bold text-dark">Have a Promo Code?</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control text-uppercase"
                    placeholder="STAESH500"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                  />
                  <button
                    type="submit"
                    className={`btn ${couponApplied ? 'btn-success' : 'btn-dark'} font-heading`}
                    disabled={couponApplied}
                  >
                    {couponApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
                {couponApplied && (
                  <span className="text-success extra-small fw-bold mt-1 d-block">
                    ✓ Code STAESH500 applied (-₹500)
                  </span>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="d-flex flex-column gap-2 border-bottom pb-3 mb-3 text-secondary small">
                <div className="d-flex justify-content-between">
                  <span>Bag Subtotal</span>
                  <span className="fw-semibold text-dark">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {productSavings > 0 && (
                  <div className="d-flex justify-content-between text-success">
                    <span>Product Discounts</span>
                    <span className="fw-semibold">-₹{productSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {couponApplied && (
                  <div className="d-flex justify-content-between text-success">
                    <span>Coupon Savings</span>
                    <span className="fw-semibold">-₹500</span>
                  </div>
                )}

                <div className="d-flex justify-content-between">
                  <span>Delivery Charges</span>
                  {deliveryFee === 0 ? (
                    <span className="text-success fw-bold">FREE</span>
                  ) : (
                    <span className="fw-semibold text-dark">₹99</span>
                  )}
                </div>
              </div>

              {/* Final Total */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fs-5 fw-extrabold text-dark font-heading">Total Amount</span>
                <span className="fs-3 fw-extrabold text-primary font-heading">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                className="btn btn-primary-custom w-100 justify-content-center btn-lg"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <i className="bi bi-arrow-right"></i>
              </button>

              <div className="text-center mt-3">
                <span className="text-muted extra-small d-inline-flex align-items-center gap-1">
                  <i className="bi bi-shield-lock-fill text-success"></i> 100% Encrypted & Safe Payments
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
