import React, { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InviteUser from "./InviteUser";
import GroupPostList from "../groups/GroupPosts";
import Grouptab from "../groups/Grouptab";

const API_URL = process.env.REACT_APP_API_URL;

const GroupDashboard = ({
  user,
  posts,
  onRefresh,
  onLike,
  likes,
  userLiked,
}) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const numericGroupId = Number(groupId);

  const [groupPosts, setGroupPosts] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showInvite, setShowInvite] = useState(true); // default true for desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const fetchPosts = useCallback(async () => {
    if (!groupId || !user?.id) return;

    try {
      const res = await fetch(
        `${API_URL}/get_group_posts.php?group_id=${groupId}&user_id=${user.id}`
      );
      const data = await res.json();

      if (data.success) {
        setGroupPosts(data.posts || []);
        if (data.members) {
          setGroupMembers(data.members);
        }
        if (onRefresh) onRefresh();
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (err) {
      console.error("Error fetching group posts:", err);
    }
  }, [groupId, user?.id, onRefresh]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Detect screen resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowInvite(!mobile); // sidebar auto visible if desktop
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // run once
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🚨 Require login
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h3>You must be logged in to view this group.</h3>
        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#79b8fa",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Sidebar (Invite, Members, etc.) */}
      {showInvite && (
        <div
          style={{
            width: isMobile ? "100%" : "300px",
            borderRight: "1px solid #ddd",
            padding: "20px",
            overflowY: "auto",
            background: "#f9f9f9",
          }}
        >
          <InviteUser groupId={numericGroupId} user={user} members={groupMembers} />
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#fff",
          overflowY: "auto",
        }}
      >
        <GroupPostList
          user={user}
          posts={groupPosts}
          onRefresh={fetchPosts}
          onLike={onLike}
          likes={likes}
          userLiked={userLiked}
        />
      </div>

      {/* Tabs - only if logged in */}
      <Grouptab  user={user}
          posts={groupPosts}
          onRefresh={fetchPosts}
          onLike={onLike}
          likes={likes}
          userLiked={userLiked} />

      {/* Floating Button for Mobile Only */}
      {isMobile && (
        <button
          onClick={() => setShowInvite(!showInvite)}
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            padding: "10px 16px",
            borderRadius: "50px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 100,
          }}
        >
          {showInvite ? "Close Invite" : "Invite User"}
        </button>
      )}
    </div>
  );
};

export default GroupDashboard;
