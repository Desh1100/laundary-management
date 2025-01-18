import React from "react";
import "./CompletedOrders.css";

const CompletedOrders = ({ orders }) => {
  const renderOrderCard = (order) => (
    <div key={order.id} className="order-card">
      <div className="order-status completed">Completed</div>
      <h3>{order.name}</h3>
      <div className="order-details">
        <p>
          <strong>Phone:</strong> {order.phone}
        </p>
        <p>
          <strong>Completion Date:</strong>{" "}
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
    </div>
  );

  return (
    <div className="completed-orders">
      <div className="orders-header">
        <h2>Completed Orders</h2>
        <div className="orders-summary">
          <span>
            Total Completed:{" "}
            {orders.filter((order) => order.status === "completed").length}
          </span>
        </div>
      </div>
      <div className="orders-grid">
        {orders
          .filter((order) => order.status === "completed")
          .map(renderOrderCard)}
      </div>
    </div>
  );
};

export default CompletedOrders;
