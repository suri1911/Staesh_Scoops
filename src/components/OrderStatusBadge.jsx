import React from 'react';

/**
 * Order status → display config mapping
 */
const STATUS_CONFIG = {
  pending:           { label: 'Pending',            color: 'secondary',  icon: 'bi-clock' },
  payment_pending:   { label: 'Payment Pending',    color: 'warning',    icon: 'bi-credit-card' },
  confirmed:         { label: 'Confirmed',          color: 'info',       icon: 'bi-check-circle' },
  processing:        { label: 'Processing',         color: 'info',       icon: 'bi-gear' },
  packed:            { label: 'Packed',             color: 'primary',    icon: 'bi-box-seam' },
  shipped:           { label: 'Shipped',            color: 'primary',    icon: 'bi-truck' },
  out_for_delivery:  { label: 'Out for Delivery',   color: 'warning',    icon: 'bi-bicycle' },
  delivered:         { label: 'Delivered',           color: 'success',    icon: 'bi-check-circle-fill' },
  cancelled:         { label: 'Cancelled',          color: 'danger',     icon: 'bi-x-circle' },
  refund_initiated:  { label: 'Refund Initiated',   color: 'warning',    icon: 'bi-arrow-counterclockwise' },
  refunded:          { label: 'Refunded',           color: 'success',    icon: 'bi-cash-stack' },
  returned:          { label: 'Returned',           color: 'secondary',  icon: 'bi-arrow-return-left' },
  delivery_failed:   { label: 'Delivery Failed',    color: 'danger',     icon: 'bi-exclamation-triangle' },
};

const OrderStatusBadge = ({ status, size = 'normal' }) => {
  const config = STATUS_CONFIG[status] || { label: status, color: 'secondary', icon: 'bi-question-circle' };
  const sizeClass = size === 'small' ? 'extra-small' : 'small';

  return (
    <span className={`badge bg-${config.color}-subtle text-${config.color} ${sizeClass} fw-semibold d-inline-flex align-items-center gap-1 rounded-pill px-3 py-2`}>
      <i className={`bi ${config.icon}`}></i>
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
export { STATUS_CONFIG };
