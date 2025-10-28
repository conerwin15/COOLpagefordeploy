// src/groups/PublicGroupView.js
import React, { useEffect, useState  } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import GroupInfo from "./Groupinfo";
import Publicviewgroup from "./PublicGroupview";
import X from "../icon/closeicon"

const API_URL = process.env.REACT_APP_API_URL;

export default function PublicGroupView() {
  const { groupId } = useParams();
  const numericGroupId = Number(groupId);
 const navigate = useNavigate(); // <- get the navigate function
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const [repliesByPostId, setRepliesByPostId] = useState({});
  const [members, setMembers] = useState([]);

  // Fetch posts and members
  const fetchPosts = async () => {
    if (!groupId) return;
    try {
      const res = await fetch(`${API_URL}/get_group_posts.php?group_id=${numericGroupId}`);
      const data = await res.json();
      if (data.success) {
        updateStateFromPosts(data.posts || []);
        setMembers(data.members || []); // members returned in same response
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/get_group_members.php?group_id=${numericGroupId}`);
      const data = await res.json();
      if (data.success) setMembers(data.members);
    } catch (err) {
      console.error("Error fetching group members:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (groupId) fetchGroupMembers();
  }, [groupId]);

  // Populate likes and replies state
  const updateStateFromPosts = (newPosts) => {
    setPosts(newPosts);

    const likeCounts = {};
    const likedStatus = {};
    const repliesMap = {};

    newPosts.forEach((post) => {
      likeCounts[`post_${post.id}`] = post.like_count || 0;
      likedStatus[`post_${post.id}`] = post.user_liked || false;
      repliesMap[post.id] = post.replies || [];

      post.replies?.forEach((reply) => {
        likeCounts[`reply_${reply.id}`] = reply.like_count || 0;
        likedStatus[`reply_${reply.id}`] = reply.user_liked || false;
      });
    });

    setLikes(likeCounts);
    setUserLiked(likedStatus);
    setRepliesByPostId(repliesMap);
  };

  // Public view: return full URL for profile pic, fallback if missing
  const getProfilePic = (pic) => {
    if (!pic) return `${API_URL}/uploads/default-avatar.png`;
    // If pic is already a full URL, use it
    if (/^https?:\/\//i.test(pic)) return pic;
    // Otherwise prepend uploads path
    return `${API_URL}/uploads/${pic}`;
  };

  return (
    
    <div className="tabs-container">

      <GroupInfo groupId={groupId} members={members} />
<button
      className="back-btn"
      onClick={() => navigate("/")} // ✅ now works properly
    style={{
  position: "absolute",       // or "fixed" if you want it relative to the viewport
  top: "80px",                // distance from the top
  left: "1px",              // distance from the right

  
background:"none",
border:"none",
  padding: "10px 16px",
  color: "white",
  cursor: "pointer",
}}
    >
    <X />
    </button>
      {/* Tab headers */}
      <div className="tab-header">
        <button className={activeTab === "posts" ? "active" : ""} onClick={() => setActiveTab("posts")}>
          Posts
        </button>
        <button className={activeTab === "members" ? "active" : ""} onClick={() => setActiveTab("members")}>
          Members
        </button>
    
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === "posts" && (
          <Publicviewgroup
            groupId={numericGroupId}
            user={null}
            posts={posts}
            likes={likes}
            userLiked={userLiked}
            repliesByPostId={repliesByPostId}
            onReplyAdded={() => {}}
            onLikeToggle={() => {}}
            onRefresh={fetchPosts}
          />
        )}

        {activeTab === "members" && (
          <div
            style={{
              marginBottom: "20px",
              background: "#f9f9f9",
              padding: "16px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h4 style={{ marginBottom: "12px", color: "#333", fontSize: "18px" }}>👥 Group Members</h4>
            {members.length === 0 ? (
              <p style={{ fontStyle: "italic", fontSize: "14px", color: "#888" }}>No members yet.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {members.map((member) => (
                  <li
                    key={member.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 12px",
                      marginBottom: "8px",
                      background: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                 
                
                    <div>
                      <span style={{ fontWeight: 500, color: "#333" }}>{member.username}</span>
                      <br />
                      <small style={{ color: "#555" }}>{member.role?.toUpperCase() || "MEMBER"}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

     
      </div>
    </div>
  );
}
