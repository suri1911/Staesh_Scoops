import React from 'react';

const Rating = ({ rating = 5, reviews = 0, showCount = true, size = 'sm' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="d-inline-flex align-items-center gap-1">
      <div className="text-warning d-flex">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className={`bi bi-star-fill ${size === 'lg' ? 'fs-5' : 'small'}`}></i>
        ))}
        {hasHalfStar && <i className={`bi bi-star-half ${size === 'lg' ? 'fs-5' : 'small'}`}></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className={`bi bi-star ${size === 'lg' ? 'fs-5' : 'small'} text-muted`}></i>
        ))}
      </div>
      <span className="fw-semibold ms-1 text-dark small">{rating}</span>
      {showCount && reviews > 0 && (
        <span className="text-muted extra-small">({reviews})</span>
      )}
    </div>
  );
};

export default Rating;
