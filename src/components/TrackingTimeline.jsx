import React from 'react';

/**
 * Ordered list of statuses that form the main tracking progression.
 * Statuses outside this list (cancelled, refunded, etc.) are handled separately.
 */
const MAIN_TIMELINE = [
  { key: 'confirmed',         icon: 'bi-check-circle-fill',    label: 'Order Confirmed' },
  { key: 'payment_confirmed', icon: 'bi-credit-card-2-front',  label: 'Payment Confirmed' },
  { key: 'processing',        icon: 'bi-gear-fill',            label: 'Processing' },
  { key: 'packed',            icon: 'bi-box-seam-fill',        label: 'Packed' },
  { key: 'shipped',           icon: 'bi-truck',                label: 'Shipped' },
  { key: 'out_for_delivery',  icon: 'bi-bicycle',              label: 'Out for Delivery' },
  { key: 'delivered',         icon: 'bi-house-check-fill',     label: 'Delivered' },
];

const SPECIAL_STATUSES = ['cancelled', 'refund_initiated', 'refunded', 'returned', 'delivery_failed'];

const SPECIAL_ICONS = {
  cancelled: 'bi-x-circle-fill',
  refund_initiated: 'bi-arrow-counterclockwise',
  refunded: 'bi-cash-stack',
  returned: 'bi-arrow-return-left',
  delivery_failed: 'bi-exclamation-triangle-fill',
};

/**
 * Find the index of a status in the main timeline.
 * Returns -1 if it's a special/non-linear status.
 */
function getTimelineIndex(status) {
  return MAIN_TIMELINE.findIndex((s) => s.key === status);
}

/**
 * Format a timestamp into a readable date + time string.
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' • ' + d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

const TrackingTimeline = ({ statusHistory = [], currentStatus, courierName, trackingNumber, estimatedDelivery }) => {
  // Build a map of status → history entry (latest entry per status)
  const historyMap = {};
  statusHistory.forEach((entry) => {
    historyMap[entry.status] = entry;
  });

  // Determine which step in the main timeline is the current/active one
  const currentIndex = getTimelineIndex(currentStatus);
  const isSpecialStatus = SPECIAL_STATUSES.includes(currentStatus);

  return (
    <div className="tracking-timeline">
      {/* Main timeline steps */}
      {MAIN_TIMELINE.map((step, index) => {
        const historyEntry = historyMap[step.key];
        let stepState = 'pending'; // default

        if (isSpecialStatus) {
          // If order is cancelled/returned, mark up to the point it was active
          const lastNormalEntry = statusHistory
            .filter((e) => !SPECIAL_STATUSES.includes(e.status))
            .pop();
          const lastNormalIndex = lastNormalEntry
            ? getTimelineIndex(lastNormalEntry.status)
            : -1;

          if (index <= lastNormalIndex) {
            stepState = 'completed';
          }
        } else if (index < currentIndex) {
          stepState = 'completed';
        } else if (index === currentIndex) {
          stepState = 'active';
        }

        // Override with actual history data if present
        if (historyEntry) {
          if (stepState === 'pending') stepState = 'completed';
        }

        return (
          <div key={step.key} className={`timeline-step ${stepState}`}>
            <div className="timeline-step-indicator">
              <div className={`timeline-dot ${stepState}`}>
                {stepState === 'completed' ? (
                  <i className="bi bi-check-lg"></i>
                ) : stepState === 'active' ? (
                  <i className={`bi ${step.icon}`}></i>
                ) : (
                  <i className={`bi ${step.icon}`}></i>
                )}
              </div>
              {index < MAIN_TIMELINE.length - 1 && (
                <div className={`timeline-line ${stepState === 'completed' ? 'completed' : ''}`}></div>
              )}
            </div>

            <div className="timeline-step-content">
              <h6 className={`timeline-step-title mb-0 ${stepState === 'pending' ? 'text-muted' : 'text-dark'}`}>
                {step.label}
              </h6>

              {historyEntry && (
                <div className="timeline-step-details">
                  <span className="text-muted extra-small">{formatDateTime(historyEntry.created_at)}</span>
                  {historyEntry.description && (
                    <p className="text-muted small mb-0 mt-1">{historyEntry.description}</p>
                  )}
                  {historyEntry.location && (
                    <span className="text-muted extra-small d-flex align-items-center gap-1 mt-1">
                      <i className="bi bi-geo-alt-fill text-primary"></i>
                      {historyEntry.location}
                    </span>
                  )}
                </div>
              )}

              {/* Show courier info on the Shipped step */}
              {step.key === 'shipped' && (courierName || trackingNumber) && stepState !== 'pending' && (
                <div className="mt-2 p-2 bg-light rounded-3 small">
                  {courierName && (
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-truck text-primary"></i>
                      <span className="text-muted">Courier:</span>
                      <strong className="text-dark">{courierName}</strong>
                    </div>
                  )}
                  {trackingNumber && (
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-hash text-primary"></i>
                      <span className="text-muted">Tracking:</span>
                      <strong className="text-dark font-monospace">{trackingNumber}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Show estimated delivery on Out for Delivery / Delivered */}
              {step.key === 'out_for_delivery' && estimatedDelivery && stepState !== 'pending' && (
                <div className="mt-1 extra-small text-muted d-flex align-items-center gap-1">
                  <i className="bi bi-calendar-check text-success"></i>
                  Expected: {new Date(estimatedDelivery).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Special status (cancelled, refunded, etc.) shown at the bottom */}
      {isSpecialStatus && historyMap[currentStatus] && (
        <div className="timeline-step active special-status">
          <div className="timeline-step-indicator">
            <div className="timeline-dot special">
              <i className={`bi ${SPECIAL_ICONS[currentStatus] || 'bi-exclamation-circle'}`}></i>
            </div>
          </div>

          <div className="timeline-step-content">
            <h6 className="timeline-step-title mb-0 text-danger">
              {historyMap[currentStatus].title || currentStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </h6>
            <span className="text-muted extra-small">{formatDateTime(historyMap[currentStatus].created_at)}</span>
            {historyMap[currentStatus].description && (
              <p className="text-muted small mb-0 mt-1">{historyMap[currentStatus].description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingTimeline;
