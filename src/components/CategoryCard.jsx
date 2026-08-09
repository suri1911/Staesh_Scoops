import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/shop?category=${encodeURIComponent(category.name)}`}
      className="text-decoration-none"
    >
      <div className="staesh-card text-center p-3 h-100 d-flex flex-column align-items-center justify-content-center">
        <div
          className="rounded-circle overflow-hidden mb-3 border border-3 border-light shadow-sm"
          style={{ width: '100px', height: '100px' }}
        >
          <img
            src={category.image}
            alt={category.name}
            className="w-100 h-100 object-fit-cover transition-transform"
            style={{ transition: 'transform 0.4s ease' }}
          />
        </div>
        <h6 className="fw-bold text-dark mb-1">{category.name}</h6>
        <span className="text-muted small">{category.count} Products</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
