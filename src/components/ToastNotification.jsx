import React from 'react';
import { useShop } from '../context/ShopContext';

const ToastNotification = () => {
  const { toast } = useShop();

  if (!toast) return null;

  return (
    <div className="custom-toast">
      <i className={`bi ${toast.icon} text-warning fs-5`}></i>
      <span className="fw-semibold">{toast.message}</span>
    </div>
  );
};

export default ToastNotification;
