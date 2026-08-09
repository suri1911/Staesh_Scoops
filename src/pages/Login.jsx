import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { showToast } = useShop();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      showToast('Logged in successfully! Welcome back.', 'bi-person-check-fill');
      navigate('/');
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo.user@staeshscoop.com');
    setPassword('Password123!');
    showToast('Demo login credentials filled!', 'bi-info-circle-fill');
  };

  return (
    <div className="login-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="staesh-card p-4 p-md-5">
              <div className="text-center mb-4">
                <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold mb-2" style={{ width: '45px', height: '45px', fontSize: '1.4rem' }}>
                  S
                </span>
                <h3 className="fw-extrabold text-dark font-heading">Welcome Back</h3>
                <p className="text-muted small">Sign in to manage your orders & wishlist</p>
              </div>

              <form onSubmit={handleLogin}>
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-bold small text-dark">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-envelope text-muted"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="alex.smith@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-bold small text-dark mb-0">Password</label>
                    <a href="#forgot" className="extra-small text-primary text-decoration-none fw-semibold">Forgot Password?</a>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-lock text-muted"></i></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberCheck"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-input-label small text-muted" htmlFor="rememberCheck">
                    Keep me signed in on this device
                  </label>
                </div>

                <button type="submit" className="btn btn-primary-custom w-100 justify-content-center btn-lg mb-3">
                  Sign In <i className="bi bi-box-arrow-in-right"></i>
                </button>

                <button type="button" className="btn btn-outline-secondary w-100 btn-sm mb-4" onClick={handleDemoLogin}>
                  ⚡ Auto-fill Demo Account
                </button>
              </form>

              {/* Social Login */}
              <div className="text-center border-top pt-4">
                <p className="text-muted extra-small mb-3">OR SIGN IN WITH</p>
                <button className="btn btn-outline-dark w-100 rounded-pill d-flex align-items-center justify-content-center gap-2">
                  <i className="bi bi-google text-danger"></i> Continue with Google
                </button>
              </div>

              {/* Register Link */}
              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted small">Don't have an account? </span>
                <Link to="/register" className="fw-bold text-primary text-decoration-none">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
