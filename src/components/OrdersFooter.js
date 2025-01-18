import React from "react";
import "./OrdersFooter.css";

const OrdersFooter = ({ orders }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.completedAt);
    return orderDate.toDateString() === today.toDateString();
  });

  const totalPrice = todayOrders.reduce(
    (sum, order) => sum + (order.price || 0),
    0
  );

  return (
    <div className="orders-footer">
      <div className="footer-stats">
        <div className="stat-item">
          <span className="stat-label">Today's Completed Orders:</span>
          <span className="stat-value">{todayOrders.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Today's Total Revenue:</span>
          <span className="stat-value">Rs. {totalPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default OrdersFooter;
