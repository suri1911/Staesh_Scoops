import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderByNumber } from '../services/orderService';
import OrderStatusBadge from '../components/OrderStatusBadge';
import WhatsAppStatus from '../components/WhatsAppStatus';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderByNumber(orderNumber);
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Could not load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  // Fallback if Supabase is not configured yet — show from localStorage
  const localOrder = !order && orderNumber ? {
    order_number: orderNumber,
    order_status: 'confirmed',
    payment_status: 'paid',
    total_amount: null,
    estimated_delivery: null,
    created_at: new Date().toISOString(),
  } : null;

  const displayOrder = order || localOrder;

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Loading your order details...</p>
      </div>
    );
  }

  if (!displayOrder) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="staesh-card p-5 max-w-lg mx-auto">
          <i className="bi bi-question-circle fs-1 text-muted d-block mb-3"></i>
          <h3 className="fw-bold text-dark mb-2">Order Not Found</h3>
          <p className="text-muted mb-4">We couldn't find details for this order.</p>
          <Link to="/" className="btn btn-primary-custom">
            Return to Homepage <i className="bi bi-house"></i>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 text-center my-5">
      <div className="staesh-card p-5 max-w-lg mx-auto border-success">
        {/* Success Icon */}
        <div className="bg-success-subtle text-success rounded-circle d-inline-flex p-4 mb-3">
          <i className="bi bi-check-circle-fill display-3"></i>
        </div>

        <h2 className="fw-extrabold text-dark font-heading mb-2">Order Confirmed! 🎉</h2>
        <p className="text-muted mb-3">
          Thank you for shopping with <strong>Staesh_Scoops</strong>.
        </p>

        {/* Order Details Card */}
        <div className="bg-light p-3 rounded-3 mb-4 text-start small border">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Order ID:</span>
            <strong className="text-dark font-monospace">{displayOrder.order_number}</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Order Date:</span>
            <strong className="text-dark">
              {new Date(displayOrder.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </strong>
          </div>
          {displayOrder.total_amount && (
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Total Amount:</span>
              <strong className="text-primary fs-6">₹{Number(displayOrder.total_amount).toLocaleString('en-IN')}</strong>
            </div>
          )}
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Payment Status:</span>
            <strong className={`text-${displayOrder.payment_status === 'paid' ? 'success' : 'warning'} text-capitalize`}>
              {displayOrder.payment_status === 'paid' ? '✓ Paid' : 'Pending (COD)'}
            </strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Order Status:</span>
            <OrderStatusBadge status={displayOrder.order_status} size="small" />
          </div>
          {displayOrder.estimated_delivery && (
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Estimated Delivery:</span>
              <strong className="text-success">
                {new Date(displayOrder.estimated_delivery).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>
            </div>
          )}
        </div>

        {/* WhatsApp Status */}
        <div className="mb-4">
          <WhatsAppStatus status="sent" />
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
          <Link
            to={`/track-order?order=${displayOrder.order_number}`}
            className="btn btn-primary-custom btn-lg"
          >
            <i className="bi bi-geo-alt"></i> Track Order
          </Link>
          <Link to="/" className="btn btn-outline-custom btn-lg">
            Continue Shopping <i className="bi bi-house"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
