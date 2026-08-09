import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const Checkout = () => {
  const { cart, getCartSubtotal, clearCart, showToast } = useShop();
  const navigate = useNavigate();

  // Form States
  const [customer, setCustomer] = useState({
    fullName: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    phone: '+91 98765 43210',
    address: 'Flat 402, Sunshine Apartments, MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'card', 'upi', 'netbanking', 'cod'
  const [upiId, setUpiId] = useState('ananya@okicici');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const subtotal = getCartSubtotal();
  const deliveryFee = subtotal > 1999 || subtotal === 0 ? 0 : 99;
  const finalTotal = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Your cart is empty!', 'bi-exclamation-triangle-fill');
      return;
    }

    const generatedId = `STAESH-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setIsOrderPlaced(true);
    clearCart();
    showToast('Order placed successfully!', 'bi-check-circle-fill');
  };

  if (isOrderPlaced) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="staesh-card p-5 max-w-lg mx-auto border-success">
          <div className="bg-success-subtle text-success rounded-circle d-inline-flex p-4 mb-3">
            <i className="bi bi-check-circle-fill display-3"></i>
          </div>
          <h2 className="fw-extrabold text-dark font-heading mb-2">Order Confirmed! 🎉</h2>
          <p className="text-muted mb-3">
            Thank you for shopping with <strong>Staesh_Scoops</strong>. We have sent the confirmation invoice to <strong>{customer.email}</strong>.
          </p>

          <div className="bg-light p-3 rounded-3 mb-4 text-start small border">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Order ID:</span>
              <strong className="text-dark">{orderId}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Estimated Delivery:</span>
              <strong className="text-success">In 3 Business Days</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Payment Method:</span>
              <strong className="text-uppercase">{paymentMethod}</strong>
            </div>
          </div>

          <Link to="/" className="btn btn-primary-custom btn-lg">
            Return to Homepage <i className="bi bi-house"></i>
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="staesh-card p-5 max-w-md mx-auto">
          <i className="bi bi-bag-x fs-1 text-muted d-block mb-3"></i>
          <h3 className="fw-bold text-dark mb-2">No Items to Checkout</h3>
          <p className="text-muted mb-4">Please add items to your cart before proceeding to checkout.</p>
          <Link to="/shop" className="btn btn-primary-custom">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page py-5">
      <div className="container">
        <div className="mb-4">
          <h2 className="fw-extrabold text-dark font-heading mb-1">Checkout</h2>
          <p className="text-muted small">Complete your delivery and payment details</p>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="row g-4">
            {/* Left: Customer Info & Shipping Address */}
            <div className="col-lg-7">
              {/* Customer Information */}
              <div className="staesh-card p-4 mb-4">
                <h5 className="fw-bold mb-3 text-dark font-heading border-bottom pb-2">
                  <i className="bi bi-person-fill text-primary me-2"></i>1. Customer Information
                </h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control"
                      value={customer.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={customer.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small fw-bold text-dark">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={customer.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="staesh-card p-4 mb-4">
                <h5 className="fw-bold mb-3 text-dark font-heading border-bottom pb-2">
                  <i className="bi bi-geo-alt-fill text-primary me-2"></i>2. Shipping Address
                </h5>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-dark">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      value={customer.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-dark">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={customer.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-dark">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-control"
                      value={customer.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-dark">PIN Code</label>
                    <input
                      type="text"
                      name="pincode"
                      className="form-control"
                      value={customer.pincode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="staesh-card p-4">
                <h5 className="fw-bold mb-3 text-dark font-heading border-bottom pb-2">
                  <i className="bi bi-credit-card-2-front-fill text-primary me-2"></i>3. Select Payment Method
                </h5>

                <div className="d-flex flex-column gap-3 mb-4">
                  {/* UPI */}
                  <label className={`staesh-card p-3 d-flex align-items-center cursor-pointer border-2 ${paymentMethod === 'upi' ? 'border-primary bg-light' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="form-check-input me-3"
                    />
                    <div className="flex-grow-1">
                      <span className="fw-bold text-dark d-block">UPI (Google Pay / PhonePe / Paytm)</span>
                      <span className="text-muted extra-small">Instant & Zero Transaction Fee</span>
                    </div>
                    <i className="bi bi-phone-fill fs-4 text-primary"></i>
                  </label>

                  {paymentMethod === 'upi' && (
                    <div className="ps-4 ms-3 pe-3 mb-2">
                      <label className="form-label extra-small fw-bold text-dark">Enter UPI ID</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="username@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Credit / Debit Card */}
                  <label className={`staesh-card p-3 d-flex align-items-center cursor-pointer border-2 ${paymentMethod === 'card' ? 'border-primary bg-light' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="form-check-input me-3"
                    />
                    <div className="flex-grow-1">
                      <span className="fw-bold text-dark d-block">Credit / Debit Card</span>
                      <span className="text-muted extra-small">Visa, Mastercard, RuPay, Amex</span>
                    </div>
                    <i className="bi bi-credit-card-fill fs-4 text-primary"></i>
                  </label>

                  {/* Net Banking */}
                  <label className={`staesh-card p-3 d-flex align-items-center cursor-pointer border-2 ${paymentMethod === 'netbanking' ? 'border-primary bg-light' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="form-check-input me-3"
                    />
                    <div className="flex-grow-1">
                      <span className="fw-bold text-dark d-block">Net Banking</span>
                      <span className="text-muted extra-small">HDFC, ICICI, SBI, Axis & all top banks</span>
                    </div>
                    <i className="bi bi-bank fs-4 text-primary"></i>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`staesh-card p-3 d-flex align-items-center cursor-pointer border-2 ${paymentMethod === 'cod' ? 'border-primary bg-light' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="form-check-input me-3"
                    />
                    <div className="flex-grow-1">
                      <span className="fw-bold text-dark d-block">Cash on Delivery (COD)</span>
                      <span className="text-muted extra-small">Pay with cash or UPI upon delivery</span>
                    </div>
                    <i className="bi bi-cash-stack fs-4 text-primary"></i>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="col-lg-5">
              <div className="staesh-card p-4 sticky-top" style={{ top: '100px' }}>
                <h5 className="fw-bold mb-3 border-bottom pb-2 text-dark font-heading">
                  Order Summary ({cart.length} Items)
                </h5>

                <div className="d-flex flex-column gap-3 mb-4 max-h-60 overflow-y-auto pr-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-3 border-bottom pb-2">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="rounded object-fit-cover"
                        style={{ width: '50px', height: '50px' }}
                      />
                      <div className="flex-grow-1 overflow-hidden">
                        <h6 className="fw-bold text-truncate mb-0 small text-dark">{item.product.name}</h6>
                        <span className="text-muted extra-small">Qty: {item.quantity}</span>
                      </div>
                      <span className="fw-bold small text-dark">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-bottom pb-3 mb-3 small d-flex flex-column gap-2 text-secondary">
                  <div className="d-flex justify-content-between">
                    <span>Subtotal</span>
                    <span className="fw-bold text-dark">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="text-success fw-bold">FREE</span>
                    ) : (
                      <span className="fw-bold text-dark">₹99</span>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fs-5 fw-extrabold text-dark font-heading">Final Payable</span>
                  <span className="fs-3 fw-extrabold text-primary font-heading">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <button type="submit" className="btn btn-primary-custom w-100 justify-content-center btn-lg">
                  Place Order • ₹{finalTotal.toLocaleString('en-IN')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
