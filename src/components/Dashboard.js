import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import "./Dashboard.css";
import {
  FaHome,
  FaCheckCircle,
  FaSpinner,
  FaCog,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import CompletedOrders from "./CompletedOrders";
import InProgressOrders from "./InProgressOrders";
import Settings from "./Settings";

const Dashboard = ({ user }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    completionDate: "",
    price: "",
  });
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersQuery = query(
        collection(db, "laundry"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString() || "N/A",
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setStatus({
        message: "Error fetching orders: " + error.message,
        type: "error",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "", type: "" });

    try {
      const orderData = {
        ...formData,
        price: Number(formData.price),
        createdAt: serverTimestamp(),
        status: "pending",
        cashierName: user.displayName || "Unknown Cashier",
        cashierId: user.uid,
      };

      await addDoc(collection(db, "laundry"), orderData);
      await fetchOrders();

      setFormData({
        name: "",
        phone: "",
        completionDate: "",
        price: "",
      });

      setStatus({
        message: "Order placed successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error details:", error);
      setStatus({
        message: "Error placing order: " + error.message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  const renderOrderForm = () => (
    <div className="order-form">
      <h2>New Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="name">Customer Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Ex: 771234567"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="completionDate">Completion Date</label>
            <input
              id="completionDate"
              type="date"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="price">Price (Rs.)</label>
            <input
              id="price"
              type="number"
              name="price"
              placeholder="Enter price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Placing Order..." : "Place Order"}
        </button>
      </form>

      {status.message && (
        <p className={`status ${status.type}`}>{status.message}</p>
      )}
    </div>
  );

  const renderOrderCard = (order) => (
    <div key={order.id} className="order-card">
      <h3>{order.name}</h3>
      <p>Phone: {order.phone}</p>
      <p>
        Completion Date: {new Date(order.completionDate).toLocaleDateString()}
      </p>
      <p>Price: Rs. {order.price}</p>
      <p>Status: {order.status}</p>
      <p>Created: {order.createdAt}</p>
      <p>Cashier: {order.cashierName}</p>
    </div>
  );

  return (
    <div className={`admin-dashboard ${darkMode ? "dark-mode" : ""}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>LMS Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaHome /> Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            <FaCheckCircle /> Completed Orders
          </button>
          <button
            className={`nav-item ${activeTab === "inprocess" ? "active" : ""}`}
            onClick={() => setActiveTab("inprocess")}
          >
            <FaSpinner /> In Process
          </button>
          <button
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <FaCog /> Settings
          </button>
        </nav>
      </div>

      <div className="main-content">
        <header className="top-header">
          <div className="header-content">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <div className="header-actions">
              <button className="theme-toggle" onClick={toggleDarkMode}>
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              <div className="user-info">
                <span>Welcome, {user.displayName || "Cashier"}</span>
                <button
                  className="logout-button"
                  onClick={() => auth.signOut()}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {activeTab === "dashboard" && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p>{orders.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Pending Orders</h3>
                  <p>
                    {
                      orders.filter((order) => order.status === "pending")
                        .length
                    }
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Completed Orders</h3>
                  <p>
                    {
                      orders.filter((order) => order.status === "completed")
                        .length
                    }
                  </p>
                </div>
              </div>

              {renderOrderForm()}

              <div className="orders-list">
                <h2>Recent Orders</h2>
                <div className="orders-grid">{orders.map(renderOrderCard)}</div>
              </div>
            </>
          )}

          {activeTab === "completed" && <CompletedOrders orders={orders} />}

          {activeTab === "inprocess" && <InProgressOrders orders={orders} />}

          {activeTab === "settings" && <Settings user={user} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
