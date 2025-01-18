import React, { useState } from "react";
import "./CompletedOrders.css";
import { FaSearch } from "react-icons/fa";
import OrdersFooter from "./OrdersFooter";

const CompletedOrders = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState("");

  const completedOrders = orders
    .filter((order) => order.status === "completed")
    .sort((a, b) => (a.orderId || 0) - (b.orderId || 0));

  const filteredOrders = completedOrders.filter((order) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const orderIdString = (order.orderId || "").toString();
    const nameMatch = order.name.toLowerCase().includes(searchLower);
    const idMatch = orderIdString.includes(searchLower);

    return idMatch || nameMatch;
  });

  return (
    <div className="completed-container">
      <div className="table-header">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`search-input ${isSearchFocused ? "focused" : ""}`}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Due Date</th>
              <th>Price (Rs.)</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="order-id">#{order.orderId || "N/A"}</span>
                  </td>
                  <td>{order.name}</td>
                  <td>{order.phone}</td>
                  <td>{new Date(order.completionDate).toLocaleDateString()}</td>
                  <td>{order.price}</td>
                  <td>{order.createdAt}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      Completed
                    </span>
                  </td>
                  <td>{order.completedAt || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-orders">
                  {searchTerm
                    ? "No matching orders found"
                    : "No completed orders"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrdersFooter orders={completedOrders} />
    </div>
  );
};

export default CompletedOrders;
