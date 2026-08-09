import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist, products } = useShop();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  if (savedProducts.length === 0) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="staesh-card p-5 max-w-md mx-auto">
          <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 text-danger">
            <i className="bi bi-heartbreak fs-1"></i>
          </div>
          <h3 className="fw-bold text-dark font-heading mb-2">Your Wishlist is Empty</h3>
          <p className="text-muted mb-4">
            Explore our catalog and click the heart icon to save your favorite products here!
          </p>
          <Link to="/shop" className="btn btn-primary-custom btn-lg">
            Explore Products <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page py-5">
      <div className="container">
        <div className="mb-4">
          <h2 className="fw-extrabold text-dark font-heading mb-1">My Saved Wishlist</h2>
          <p className="text-muted small">
            {savedProducts.length} items saved for later
          </p>
        </div>

        <div className="row g-4">
          {savedProducts.map((product) => (
            <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
