import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center my-5">
      <div className="staesh-card p-5 max-w-md mx-auto">
        <h1 className="display-1 fw-extrabold text-primary font-heading mb-0">404</h1>
        <h3 className="fw-bold text-dark font-heading mb-3">Page Not Found</h3>
        <p className="text-muted mb-4">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link to="/" className="btn btn-primary-custom btn-lg">
          Back to Homepage <i className="bi bi-house"></i>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
