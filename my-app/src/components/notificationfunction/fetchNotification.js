import React, { useEffect, useState } from "react";
import "./Notifications.css";
import Bellicon from "../icon/bellicon";

const API_URL = process.env.REACT_APP_API_URL;

// 🕒 Format timestamps as “2s ago”, “3m ago”, “1 day ago”, etc.
function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export default function Notifications({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);
  const [popupNotif, setPopupNotif] = useState(null); // 🔔 popup state

  // 🔁 Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/get_notifications.php?user_id=${userId}`);
      const data = await res.json();
      if (data.success) {
        // Detect new notifications
        if (notifications.length && data.notifications.length > notifications.length) {
          const latest = data.notifications[0];
          showPopup(latest); // 🟢 show popup for newest one
        }
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [userId]);

  // 🟡 Count unread notifications
  const unreadCount = notifications.filter(
    (n) => n.is_read === "0" || n.is_read === 0
  ).length;

  // ✅ Mark notification as read
  const markAsRead = async (notifId, link) => {
    try {
      const res = await fetch(`${API_URL}/mark_read.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notifId }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, is_read: 1 } : n))
        );
        if (link) window.open(link, "_blank");
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // 🔔 Show popup briefly
  const showPopup = (notif) => {
    setPopupNotif(notif);
    setTimeout(() => setPopupNotif(null), 3000); // show for 3 seconds
  };

  return (
    <div className="notif-wrapper">
      {/* 🔔 Notification Bell */}
      <button className="notif-btn" onClick={() => setShowList(!showList)}>
        <Bellicon />
        {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
      </button>

      {/* 📜 Notification Dropdown */}
      {showList && (
        <div className="notif-dropdown">
          <div className="notif-header">Notifications</div>
          {notifications.length === 0 ? (
            <p className="notif-empty">No notifications yet</p>
          ) : (
            notifications.map((n) => {
              const profilePic =
                n.profile_pic && n.profile_pic.startsWith("http")
                  ? n.profile_pic
                  : `${API_URL}/uploads/default-avatar.png`;

              const senderName = n.username !== "Unknown" ? n.username : "Someone";

              return (
                <div
                  key={n.id}
                  className={`notif-item ${
                    n.is_read === 0 || n.is_read === "0" ? "unread" : ""
                  }`}
                  onClick={() => markAsRead(n.id, n.link)}
                >
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="notif-avatar"
                    onError={(e) =>
                      (e.target.src = `${API_URL}/default-avatar.png`)
                    }
                  />
                  <div className="notif-content">
                    <span className="notif-message">
                      <strong>{senderName}</strong> {n.message.replace(senderName, "")}
                    </span>
                    <small className="notif-time">{timeAgo(n.created_at)}</small>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 🟢 Popup Notification */}
      {popupNotif && (
        <div
          className="notif-popup"
          onClick={() => markAsRead(popupNotif.id, popupNotif.link)}
        >
          <img
            src={popupNotif.profile_pic}
            alt="Profile"
            className="notif-popup-avatar"
          />
          <div className="notif-popup-content">
            <strong>{popupNotif.username || "Someone"}</strong>{" "}
            {popupNotif.message}
          </div>
        </div>
      )}
    </div>
  );
}
