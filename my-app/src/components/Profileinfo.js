// src/users/UserProfile.js
import React, { useEffect, useState } from "react";

export default function UserProfile({ userId }) {
  const [userInfo, setUserInfo] = useState(null);
const API_URL =  process.env.REACT_APP_API_URL;
  useEffect(() => {
    if (!userId) return;

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/get_user_profile.php?user_id=${userId}`);
        const data = await res.json();

        if (data.success && data.user) {
          // Fix escaped slashes in profile_pic URL
          const profilePic = data.user.profile_pic
            ? data.user.profile_pic.replace(/\\/g, "")
            : "http://localhost/coolpage/my-app/backend/default-avatar.png";

          setUserInfo({
            username: data.user.username,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            profile_pic: profilePic,
          });
        } else {
          console.error("User not found or API error:", data.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchUserInfo();
  }, [userId]);

  if (!userInfo) return <p>Loading user profile...</p>;

  return (
  <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    margin: "20px auto",      // centers horizontally and adds top/bottom spacing
    border: "1px solid #ddd",
 
    overflow: "hidden",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "100%",             // takes 90% of the screen width
    maxWidth: "100%",        // caps width on large screens
    minWidth: "280px",        // ensures it doesn't get too small on tiny devices
  }}
>
      {/* Profile Banner */}
      <div style={{ position: "relative", width: "100%", height: "120px", backgroundColor: "#f0f0f0" }}>
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid white",
            backgroundColor: "#ccc",
          }}
        >
          <img
            src={userInfo.profile_pic}
            alt={`${userInfo.first_name} ${userInfo.last_name}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* User Details */}
      <div style={{ padding: "16px", paddingTop: "46px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#222" }}>
          {userInfo.first_name} {userInfo.last_name}
        </h2>
        <p style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>Username: {userInfo.username}</p>
      </div>
    </div>
  );
}
