import React, { useState } from "react";
import "./Settings.css";

const Settings = ({ user }) => {
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: false,
    orderUpdates: true,
    dailyReport: false,
  });

  const handleNotificationChange = (setting) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <div className="settings-container">
      <div className="settings-section">
        <h2>User Settings</h2>
        <div className="user-profile">
          <div className="profile-info">
            <h3>Profile Information</h3>
            <p>
              <strong>Name:</strong> {user.displayName || "Not set"}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Account Created:</strong>{" "}
              {new Date(user.metadata.creationTime).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Notifications</h2>
        <div className="notification-settings">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="notification-option">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleNotificationChange(key)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="notification-label">
                {key
                  .split(/(?=[A-Z])/)
                  .join(" ")
                  .toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
