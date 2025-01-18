import React from "react";
import "./InProgressOrders.css";

const InProgressOrders = ({ orders }) => {
  const renderOrderCard = (order) => (
    <div key={order.id} className="order-card">
      <div className="order-status pending">In Progress</div>
      <h3>{order.name}</h3>
      <div className="order-details">
        <p>
          <strong>Phone:</strong> {order.phone}
        </p>
        <p>
          <strong>Expected Completion:</strong>{" "}
          {new Date(order.completionDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Price:</strong> Rs. {order.price}
        </p>
        <p>
          <strong>Created:</strong> {order.createdAt}
        </p>
        <p>
          <strong>Cashier:</strong> {order.cashierName}
        </p>
      </div>
      <div className="time-remaining">
        {new Date(order.completionDate) > new Date() ? (
          <span className="on-time">On Time</span>
        ) : (
          <span className="delayed">Delayed</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="in-progress-orders">
      <div className="orders-header">
        <h2>In Progress Orders</h2>
        <div className="orders-summary">
          <span>
            In Progress:{" "}
            {orders.filter((order) => order.status === "pending").length}
          </span>
        </div>
      </div>
      <div className="orders-grid">
        {orders
          .filter((order) => order.status === "pending")
          .map(renderOrderCard)}
      </div>
    </div>
  );
};

export default InProgressOrders;
