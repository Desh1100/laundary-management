import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  runTransaction,
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
  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    completionDate: "",
    price: "",
  });

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
        ...doc.data(),
        id: doc.id,
        orderId: doc.data().id || 0,
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

  const validateForm = () => {
    const errors = {
      name: "",
      phone: "",
      completionDate: "",
      price: "",
    };
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
      isValid = false;
    }

    // Phone validation (Sri Lankan format)
    const phoneRegex = /^(?:7|0)[0-9]{8,9}$/;
    if (!formData.phone) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = "Enter a valid Sri Lankan phone number";
      isValid = false;
    }

    // Completion date validation
    const selectedDate = new Date(formData.completionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.completionDate) {
      errors.completionDate = "Completion date is required";
      isValid = false;
    } else if (selectedDate < today) {
      errors.completionDate = "Completion date cannot be in the past";
      isValid = false;
    }

    // Price validation
    if (!formData.price) {
      errors.price = "Price is required";
      isValid = false;
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.price = "Enter a valid price";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const getNextOrderId = async () => {
    const counterRef = doc(db, "counters", "orderId");

    try {
      const result = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        let nextId = 1;
        if (counterDoc.exists()) {
          nextId = counterDoc.data().value + 1;
        }

        transaction.set(counterRef, { value: nextId });
        return nextId;
      });

      return result;
    } catch (error) {
      console.error("Error getting next order ID:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ message: "", type: "" });

    try {
      const orderId = await getNextOrderId();

      const orderData = {
        id: orderId,
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
        message: `Order #${orderId} placed successfully!`,
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

  const getTomorrowsOrders = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return orders.filter((order) => {
      const completionDate = new Date(order.completionDate);
      completionDate.setHours(0, 0, 0, 0);
      return completionDate.getTime() === tomorrow.getTime();
    });
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
              className={formErrors.name ? "error" : ""}
              required
            />
            {formErrors.name && (
              <span className="error-message">{formErrors.name}</span>
            )}
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
              className={formErrors.phone ? "error" : ""}
              required
            />
            {formErrors.phone && (
              <span className="error-message">{formErrors.phone}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="completionDate">Completion Date</label>
            <input
              id="completionDate"
              type="date"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleInputChange}
              className={formErrors.completionDate ? "error" : ""}
              required
            />
            {formErrors.completionDate && (
              <span className="error-message">{formErrors.completionDate}</span>
            )}
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
              className={formErrors.price ? "error" : ""}
              required
            />
            {formErrors.price && (
              <span className="error-message">{formErrors.price}</span>
            )}
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
      <div className="order-header">
        <h3>Order #{order.orderId || "N/A"}</h3>
        <span className={`status-badge ${order.status}`}>{order.status}</span>
      </div>
      <div className="order-details">
        <p>
          <strong>Customer:</strong> {order.name}
        </p>
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
                <span>{user.displayName || "Cashier"}</span>
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
              <div className="dashboard-layout">
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
                  <div className="stat-card highlight">
                    <h3>Due Tomorrow</h3>
                    <p>{getTomorrowsOrders().length}</p>
                  </div>
                </div>

                <div className="order-form-container">{renderOrderForm()}</div>

                {getTomorrowsOrders().length > 0 && (
                  <div className="orders-list tomorrow-orders">
                    <h2>Orders Due Tomorrow</h2>
                    <div className="orders-grid">
                      {getTomorrowsOrders().map(renderOrderCard)}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "completed" && <CompletedOrders orders={orders} />}

          {activeTab === "inprocess" && (
            <InProgressOrders orders={orders} fetchOrders={fetchOrders} />
          )}

          {activeTab === "settings" && <Settings user={user} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
