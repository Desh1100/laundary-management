import React, { useState } from "react";
import "./InProgressOrders.css";
import { FaSearch } from "react-icons/fa";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import AlertDialog from "./AlertDialog";
import OrdersFooter from "./OrdersFooter";

const InProgressOrders = ({ orders, fetchOrders }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    orderId: null,
    documentId: null,
  });

  const inProgressOrders = orders
    .filter((order) => order.status === "pending")
    .sort((a, b) => (a.orderId || 0) - (b.orderId || 0));

  const filteredOrders = inProgressOrders.filter((order) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const orderIdString = (order.orderId || "").toString();
    const nameMatch = order.name.toLowerCase().includes(searchLower);
    const idMatch = orderIdString.includes(searchLower);

    return idMatch || nameMatch;
  });

  const handleStatusChangeClick = (orderId, documentId) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) {
      alert("Order not found!");
      return;
    }

    setAlertDialog({
      isOpen: true,
      orderId: orderId || "N/A",
      documentId: order.id,
    });
  };

  const handleStatusChange = async () => {
    const { documentId } = alertDialog;
    if (!documentId) {
      alert("Invalid order reference");
      return;
    }

    setUpdatingId(documentId);
    setAlertDialog({ isOpen: false, orderId: null, documentId: null });

    try {
      const orderRef = doc(db, "laundry", documentId);

      await updateDoc(orderRef, {
        status: "completed",
        completedAt: new Date().toLocaleString(),
      });

      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      console.log("Document ID:", documentId);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="in-progress-container">
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title="Confirm Order Completion"
        message={`Are you sure you want to mark Order #${
          alertDialog.orderId || "N/A"
        } as completed?`}
        onClose={() =>
          setAlertDialog({ isOpen: false, orderId: null, documentId: null })
        }
        onConfirm={handleStatusChange}
      />

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
              <th>Action</th>
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
                      {order.status === "pending" ? "In Progress" : "Completed"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="complete-button"
                      onClick={() =>
                        handleStatusChangeClick(order.orderId, order.id)
                      }
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? "Saving..." : "Mark Complete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-orders">
                  {searchTerm
                    ? "No matching orders found"
                    : "No orders in progress"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrdersFooter
        orders={orders.filter((order) => order.status === "completed")}
      />
    </div>
  );
};

export default InProgressOrders;
