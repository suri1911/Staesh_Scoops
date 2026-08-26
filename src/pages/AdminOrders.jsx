import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getAllOrders, updateOrderStatus, checkIsAdmin, getWhatsAppMessages } from '../services/orderService';
import OrderStatusBadge from '../components/OrderStatusBadge';
import WhatsAppStatus from '../components/WhatsAppStatus';
import { useShop } from '../context/ShopContext';

const VALID_STATUSES = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refund_initiated', label: 'Refund Initiated' },
  { value: 'refunded', label: 'Refunded' },
];

const AdminOrders = () => {
  const { showToast } = useShop();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Status update form state
  const [statusForm, setStatusForm] = useState({
    new_status: '',
    courier_name: '',
    tracking_number: '',
    estimated_delivery: '',
    description: '',
    location: '',
  });

  // WhatsApp messages for expanded order
  const [whatsappMessages, setWhatsappMessages] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showToast('Please sign in as an admin.', 'bi-exclamation-circle-fill');
          navigate('/login');
          return;
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck) {
          showToast('Admin access required.', 'bi-shield-exclamation');
          navigate('/');
          return;
        }

        setIsAdmin(true);
        await fetchOrders();
      } catch (err) {
        console.error('Admin init failed:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      showToast('Failed to load orders.', 'bi-exclamation-triangle-fill');
    }
  };

  const toggleExpandOrder = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setWhatsappMessages([]);
      setStatusForm({
        new_status: '',
        courier_name: '',
        tracking_number: '',
        estimated_delivery: '',
        description: '',
        location: '',
      });
      return;
    }

    setExpandedOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    setStatusForm({
      new_status: order?.order_status || '',
      courier_name: order?.courier_name || '',
      tracking_number: order?.tracking_number || '',
      estimated_delivery: order?.estimated_delivery || '',
      description: '',
      location: '',
    });

    // Fetch WhatsApp messages
    try {
      const msgs = await getWhatsAppMessages(orderId);
      setWhatsappMessages(msgs);
    } catch (err) {
      console.error('Failed to fetch WhatsApp messages:', err);
    }
  };

  const handleStatusUpdate = async (orderId) => {
    if (!statusForm.new_status) {
      showToast('Please select a status.', 'bi-exclamation-circle-fill');
      return;
    }

    const order = orders.find((o) => o.id === orderId);
    if (order?.order_status === statusForm.new_status && !statusForm.courier_name && !statusForm.tracking_number) {
      showToast('No changes to save.', 'bi-info-circle-fill');
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      await updateOrderStatus(orderId, statusForm.new_status, {
        courier_name: statusForm.courier_name || undefined,
        tracking_number: statusForm.tracking_number || undefined,
        estimated_delivery: statusForm.estimated_delivery || undefined,
        description: statusForm.description || undefined,
        location: statusForm.location || undefined,
      });

      showToast(`Order updated to "${statusForm.new_status}"`, 'bi-check-circle-fill');
      await fetchOrders();

      // Refresh WhatsApp messages
      const msgs = await getWhatsAppMessages(orderId);
      setWhatsappMessages(msgs);
    } catch (err) {
      console.error('Status update failed:', err);
      showToast(`Update failed: ${err.message}`, 'bi-exclamation-triangle-fill');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="admin-orders-page py-5">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4">
          <div>
            <h2 className="fw-extrabold text-dark font-heading mb-1">
              <i className="bi bi-shield-lock text-primary me-2"></i>Admin — Orders
            </h2>
            <p className="text-muted small mb-0">{orders.length} total orders</p>
          </div>
          <button className="btn btn-outline-custom mt-2 mt-sm-0" onClick={fetchOrders}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>

        {/* Orders Table */}
        {orders.length === 0 ? (
          <div className="staesh-card p-5 text-center">
            <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
            <h4 className="fw-bold text-dark mb-2">No Orders Yet</h4>
            <p className="text-muted">Orders will appear here once customers place them.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div key={order.id} className="staesh-card">
                  {/* Order Summary Row */}
                  <div
                    className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-start cursor-pointer"
                    onClick={() => toggleExpandOrder(order.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="fw-bold text-dark font-heading mb-0 font-monospace">
                          #{order.order_number}
                        </h6>
                        <OrderStatusBadge status={order.order_status} size="small" />
                        <span className={`badge bg-${order.payment_status === 'paid' ? 'success' : 'warning'}-subtle text-${order.payment_status === 'paid' ? 'success' : 'warning'} extra-small rounded-pill px-2 py-1`}>
                          {order.payment_status === 'paid' ? '₹ Paid' : '₹ ' + order.payment_status}
                        </span>
                      </div>

                      <div className="d-flex flex-wrap gap-3 text-muted small mt-1">
                        <span><i className="bi bi-person me-1"></i>{order.customer_name}</span>
                        <span><i className="bi bi-telephone me-1"></i>{order.customer_phone}</span>
                        <span className="fw-bold text-primary">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                        <span>
                          <i className="bi bi-calendar3 me-1"></i>
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 mt-md-0">
                      <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} fs-5 text-muted`}></i>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-top p-4 bg-light">
                      <div className="row g-4">
                        {/* Left: Order details */}
                        <div className="col-lg-6">
                          <h6 className="fw-bold text-dark mb-3">
                            <i className="bi bi-list-check text-primary me-2"></i>Order Items
                          </h6>
                          <div className="d-flex flex-column gap-2 mb-3">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="d-flex align-items-center gap-2 bg-white p-2 rounded-3 small border">
                                {item.product_image && (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    className="rounded object-fit-cover"
                                    style={{ width: '36px', height: '36px' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                )}
                                <div className="flex-grow-1">
                                  <span className="fw-bold text-dark">{item.product_name}</span>
                                  <span className="text-muted ms-2">× {item.quantity}</span>
                                </div>
                                <span className="fw-bold text-primary">₹{Number(item.total_price).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Address */}
                          <h6 className="fw-bold text-dark mb-2">
                            <i className="bi bi-geo-alt text-primary me-2"></i>Shipping Address
                          </h6>
                          <p className="small text-muted mb-3">
                            {order.shipping_address?.address && `${order.shipping_address.address}, `}
                            {order.shipping_address?.city && `${order.shipping_address.city}, `}
                            {order.shipping_address?.state && `${order.shipping_address.state} `}
                            {order.shipping_address?.pincode && `- ${order.shipping_address.pincode}`}
                          </p>

                          {/* Status History */}
                          <h6 className="fw-bold text-dark mb-2">
                            <i className="bi bi-clock-history text-primary me-2"></i>Status History
                          </h6>
                          <div className="d-flex flex-column gap-1">
                            {(order.order_status_history || [])
                              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                              .map((entry) => (
                                <div key={entry.id} className="d-flex align-items-start gap-2 small">
                                  <i className="bi bi-dot fs-4 text-primary mt-n1"></i>
                                  <div>
                                    <strong className="text-dark">{entry.title}</strong>
                                    <span className="text-muted ms-2 extra-small">
                                      {new Date(entry.created_at).toLocaleString('en-IN', {
                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                      })}
                                    </span>
                                    {entry.description && <p className="text-muted mb-0 extra-small">{entry.description}</p>}
                                  </div>
                                </div>
                              ))}
                          </div>

                          {/* WhatsApp Messages */}
                          {whatsappMessages.length > 0 && (
                            <>
                              <h6 className="fw-bold text-dark mt-3 mb-2">
                                <i className="bi bi-whatsapp text-success me-2"></i>WhatsApp Messages
                              </h6>
                              <div className="d-flex flex-column gap-1">
                                {whatsappMessages.map((msg) => (
                                  <div key={msg.id} className="d-flex align-items-center gap-2 small bg-white p-2 rounded-3 border">
                                    <WhatsAppStatus status={msg.message_status} compact />
                                    <span className="text-dark">{msg.template_name?.replace(/_/g, ' ')}</span>
                                    <span className="text-muted extra-small ms-auto">
                                      {new Date(msg.created_at).toLocaleString('en-IN', {
                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                      })}
                                    </span>
                                    {msg.error_message && (
                                      <span className="text-danger extra-small" title={msg.error_message}>
                                        <i className="bi bi-info-circle"></i>
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Right: Update Status Form */}
                        <div className="col-lg-6">
                          <div className="bg-white p-4 rounded-3 border">
                            <h6 className="fw-bold text-dark mb-3">
                              <i className="bi bi-pencil-square text-primary me-2"></i>Update Order Status
                            </h6>

                            {/* Status Selector */}
                            <div className="mb-3">
                              <label className="form-label small fw-bold text-dark">New Status</label>
                              <select
                                className="form-select"
                                value={statusForm.new_status}
                                onChange={(e) => setStatusForm((prev) => ({ ...prev, new_status: e.target.value }))}
                              >
                                {VALID_STATUSES.map((s) => (
                                  <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                              </select>
                            </div>

                            {/* Courier & Tracking (show for shipped status) */}
                            {['shipped', 'out_for_delivery', 'delivered'].includes(statusForm.new_status) && (
                              <>
                                <div className="mb-3">
                                  <label className="form-label small fw-bold text-dark">Courier Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. DHL, BlueDart, Delhivery"
                                    value={statusForm.courier_name}
                                    onChange={(e) => setStatusForm((prev) => ({ ...prev, courier_name: e.target.value }))}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label small fw-bold text-dark">Tracking Number</label>
                                  <input
                                    type="text"
                                    className="form-control font-monospace"
                                    placeholder="e.g. DHL123456789"
                                    value={statusForm.tracking_number}
                                    onChange={(e) => setStatusForm((prev) => ({ ...prev, tracking_number: e.target.value }))}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label small fw-bold text-dark">Estimated Delivery</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={statusForm.estimated_delivery}
                                    onChange={(e) => setStatusForm((prev) => ({ ...prev, estimated_delivery: e.target.value }))}
                                  />
                                </div>
                              </>
                            )}

                            {/* Description & Location */}
                            <div className="mb-3">
                              <label className="form-label small fw-bold text-dark">Description (optional)</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Package handed over to courier"
                                value={statusForm.description}
                                onChange={(e) => setStatusForm((prev) => ({ ...prev, description: e.target.value }))}
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label small fw-bold text-dark">Location (optional)</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Chennai Hub"
                                value={statusForm.location}
                                onChange={(e) => setStatusForm((prev) => ({ ...prev, location: e.target.value }))}
                              />
                            </div>

                            {/* Submit */}
                            <button
                              className="btn btn-primary-custom w-100 justify-content-center"
                              onClick={() => handleStatusUpdate(order.id)}
                              disabled={updatingOrderId === order.id}
                            >
                              {updatingOrderId === order.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check2-circle"></i> Update Status & Notify
                                </>
                              )}
                            </button>

                            <p className="text-muted extra-small mt-2 text-center mb-0">
                              <i className="bi bi-whatsapp text-success me-1"></i>
                              WhatsApp notification will be sent automatically
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
