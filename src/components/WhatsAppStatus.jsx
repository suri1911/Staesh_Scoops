import React from 'react';

const STATUS_DISPLAY = {
  queued:    { icon: 'bi-clock',           label: 'Queued',     color: 'text-muted' },
  sent:      { icon: 'bi-check',           label: 'Sent',       color: 'text-success' },
  delivered: { icon: 'bi-check-all',        label: 'Delivered',  color: 'text-success' },
  read:      { icon: 'bi-check-all',        label: 'Read',       color: 'text-primary' },
  failed:    { icon: 'bi-exclamation-triangle', label: 'Failed', color: 'text-danger' },
};

const WhatsAppStatus = ({ status, compact = false }) => {
  const config = STATUS_DISPLAY[status] || STATUS_DISPLAY.queued;

  if (compact) {
    return (
      <span className={`${config.color} extra-small d-inline-flex align-items-center gap-1`} title={`WhatsApp: ${config.label}`}>
        <i className="bi bi-whatsapp"></i>
        <i className={`bi ${config.icon}`}></i>
      </span>
    );
  }

  return (
    <div className="d-inline-flex align-items-center gap-2 small">
      <i className="bi bi-whatsapp text-success"></i>
      <span className="text-muted">WhatsApp Notification</span>
      <span className={`${config.color} fw-semibold d-inline-flex align-items-center gap-1`}>
        <i className={`bi ${config.icon}`}></i>
        {config.label}
      </span>
    </div>
  );
};

export default WhatsAppStatus;
