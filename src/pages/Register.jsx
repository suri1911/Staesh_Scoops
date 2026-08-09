import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });
  const { showToast } = useShop();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match!', 'bi-exclamation-circle-fill');
      return;
    }
    showToast('Account created successfully! Welcome to Staesh_Scoops.', 'bi-person-check-fill');
    navigate('/login');
  };

  return (
    <div className="register-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="staesh-card p-4 p-md-5">
              <div className="text-center mb-4">
                <h3 className="fw-extrabold text-dark font-heading">Create an Account</h3>
                <p className="text-muted small">Join Staesh_Scoops for exclusive offers and faster checkout</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label fw-bold small text-dark">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    placeholder="Alex Smith"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email & Phone */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-dark">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-dark">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-dark">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-dark">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    className="form-check-input"
                    id="termsCheck"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                  />
                  <label className="form-check-label small text-muted" htmlFor="termsCheck">
                    I agree to the <a href="#terms" className="text-primary">Terms & Conditions</a> and <a href="#privacy" className="text-primary">Privacy Policy</a>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary-custom w-100 justify-content-center btn-lg mb-3">
                  Create Account <i className="bi bi-arrow-right"></i>
                </button>
              </form>

              <div className="text-center mt-3 pt-3 border-top">
                <span className="text-muted small">Already have an account? </span>
                <Link to="/login" className="fw-bold text-primary text-decoration-none">
                  Sign In Here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
