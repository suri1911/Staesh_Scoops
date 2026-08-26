import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackOrderPublic, subscribeToOrderUpdates } from '../services/orderService';
import TrackingTimeline from '../components/TrackingTimeline';
import OrderStatusBadge from '../components/OrderStatusBadge';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const prefilledOrder = searchParams.get('order') || '';

  const [orderInput, setOrderInput] = useState(prefilledOrder);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if order number is in URL
  useEffect(() => {
    if (prefilledOrder) {
      handleTrackOrder(prefilledOrder);
    }
  }, [prefilledOrder]);

  // Subscribe to real-time updates when viewing an order
  useEffect(() => {
    if (!orderData?.order_number) return;

    const unsubscribe = subscribeToOrderUpdates(orderData.order_number, (updatedOrder) => {
      setOrderData((prev) => ({
        ...prev,
        order_status: updatedOrder.order_status,
        courier_name: updatedOrder.courier_name,
        tracking_number: updatedOrder.tracking_number,
        estimated_delivery: updatedOrder.estimated_delivery,
      }));
    });

    return unsubscribe;
  }, [orderData?.order_number]);

  const handleTrackOrder = async (orderNum) => {
    const trimmed = (orderNum || orderInput).trim().toUpperCase();

    if (!trimmed) {
      setError('Please enter an Order ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);
    setOrderData(null);

    try {
      const data = await trackOrderPublic(trimmed);
      setOrderData(data);
    } catch (err) {
      console.error('Track order failed:', err);
      setError("We couldn't find an order with that ID. Please check your Order ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrackOrder();
  };

  return (
    <div className="track-order-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-7">

            {/* Page Header */}
            <div className="text-center mb-4">
              <div className="bg-primary-subtle text-primary rounded-circle d-inline-flex p-3 mb-3">
                <i className="bi bi-geo-alt-fill fs-2"></i>
              </div>
              <h2 className="fw-extrabold text-dark font-heading mb-1">Track Your Order</h2>
              <p className="text-muted small">Enter your Order ID to see the latest status</p>
            </div>

            {/* Search Form */}
            <div className="staesh-card p-4 mb-4">
              <form onSubmit={handleSubmit}>
                <label className="form-label fw-bold small text-dark">Order ID</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-hash text-primary"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control text-uppercase font-monospace"
                    placeholder="SS-20260813-0001"
                    value={orderInput}
                    onChange={(e) => setOrderInput(e.target.value)}
                    aria-label="Order ID"
                    id="track-order-input"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary-custom px-4"
                    disabled={loading}
                    id="track-order-btn"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Tracking...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search"></i> Track
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Error State */}
            {error && (
              <div className="staesh-card p-4 text-center border-danger">
                <i className="bi bi-search fs-2 text-danger d-block mb-2"></i>
                <h5 className="fw-bold text-dark mb-2">Order Not Found</h5>
                <p className="text-muted small mb-0">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="staesh-card p-5 text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted small mb-0">Fetching your order details...</p>
              </div>
            )}

            {/* Order Tracking Results */}
            {!loading && orderData && (
              <div className="staesh-card p-4">
                {/* Order Header */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 pb-3 border-bottom">
                  <div>
                    <h5 className="fw-bold text-dark font-heading mb-1">
                      Order #{orderData.order_number}
                    </h5>
                    <span className="text-muted extra-small">
                      Placed on {new Date(orderData.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="mt-2 mt-sm-0">
                    <OrderStatusBadge status={orderData.order_status} />
                  </div>
                </div>

                {/* Shipment Details */}
                {(orderData.courier_name || orderData.tracking_number || orderData.estimated_delivery) && (
                  <div className="bg-light p-3 rounded-3 mb-4 small">
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="bi bi-truck text-primary me-2"></i>Shipment Details
                    </h6>
                    <div className="row g-2">
                      {orderData.courier_name && (
                        <div className="col-sm-4">
                          <span className="text-muted d-block">Courier</span>
                          <strong className="text-dark">{orderData.courier_name}</strong>
                        </div>
                      )}
                      {orderData.tracking_number && (
                        <div className="col-sm-4">
                          <span className="text-muted d-block">Tracking Number</span>
                          <strong className="text-dark font-monospace">{orderData.tracking_number}</strong>
                        </div>
                      )}
                      {orderData.estimated_delivery && (
                        <div className="col-sm-4">
                          <span className="text-muted d-block">Estimated Delivery</span>
                          <strong className="text-success">
                            {new Date(orderData.estimated_delivery).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No tracking info yet */}
                {!orderData.courier_name && !orderData.tracking_number && orderData.order_status !== 'delivered' && (
                  <div className="bg-light p-3 rounded-3 mb-4 small text-center text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Tracking information will be available once your order is shipped.
                  </div>
                )}

                {/* Tracking Timeline */}
                <h6 className="fw-bold text-dark mb-3">
                  <i className="bi bi-clock-history text-primary me-2"></i>Order Progress
                </h6>
                <TrackingTimeline
                  statusHistory={orderData.status_history || []}
                  currentStatus={orderData.order_status}
                  courierName={orderData.courier_name}
                  trackingNumber={orderData.tracking_number}
                  estimatedDelivery={orderData.estimated_delivery}
                />
              </div>
            )}

            {/* Empty State — no search yet */}
            {!loading && !error && !orderData && !searched && (
              <div className="text-center text-muted py-4">
                <i className="bi bi-box-seam fs-1 d-block mb-2 opacity-50"></i>
                <p className="small mb-0">Enter your Order ID above to track your package.</p>
              </div>
            )}

            {/* Back Link */}
            <div className="text-center mt-4">
              <Link to="/" className="btn btn-outline-custom">
                <i className="bi bi-arrow-left"></i> Back to Homepage
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
