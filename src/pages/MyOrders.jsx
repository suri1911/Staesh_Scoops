import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getMyOrders } from '../services/orderService';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useShop } from '../context/ShopContext';

const MyOrders = () => {
  const { showToast } = useShop();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
          showToast('Please sign in to view your orders.', 'bi-exclamation-circle-fill');
          navigate('/login');
          return;
        }

        setUser(currentUser);
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Loading your orders...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="my-orders-page py-5">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4">
          <div>
            <h2 className="fw-extrabold text-dark font-heading mb-1">My Orders</h2>
            <p className="text-muted small mb-0">Track and manage your purchases</p>
          </div>
          <Link to="/track-order" className="btn btn-outline-custom mt-2 mt-sm-0">
            <i className="bi bi-search"></i> Track by Order ID
          </Link>
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="staesh-card p-5 text-center">
            <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 text-primary">
              <i className="bi bi-bag fs-1"></i>
            </div>
            <h4 className="fw-bold text-dark mb-2">No Orders Yet</h4>
            <p className="text-muted mb-4">Your order history will appear here once you make a purchase.</p>
            <Link to="/shop" className="btn btn-primary-custom btn-lg">
              Start Shopping <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        )}

        {/* Order List */}
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div key={order.id} className="staesh-card p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                {/* Order Info */}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <h6 className="fw-bold text-dark font-heading mb-0 font-monospace">
                      #{order.order_number}
                    </h6>
                    <OrderStatusBadge status={order.order_status} size="small" />
                  </div>

                  <div className="d-flex flex-wrap gap-3 text-muted small mb-2">
                    <span>
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="fw-bold text-primary">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </span>
                    {order.courier_name && (
                      <span>
                        <i className="bi bi-truck me-1"></i>{order.courier_name}
                      </span>
                    )}
                    {order.estimated_delivery && (
                      <span className="text-success">
                        <i className="bi bi-calendar-check me-1"></i>
                        Est. {new Date(order.estimated_delivery).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    )}
                  </div>

                  {/* Order Items Preview */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="position-relative" title={item.product_name}>
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="rounded object-fit-cover border"
                            style={{ width: '42px', height: '42px' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {item.quantity > 1 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{ fontSize: '0.6rem' }}>
                              ×{item.quantity}
                            </span>
                          )}
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <span className="text-muted extra-small">+{order.order_items.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="d-flex gap-2 mt-3 mt-md-0 ms-md-3">
                  <Link
                    to={`/track-order?order=${order.order_number}`}
                    className="btn btn-primary-custom btn-sm"
                  >
                    <i className="bi bi-geo-alt"></i> Track
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
