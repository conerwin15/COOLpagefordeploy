import React, { useState, useEffect } from "react";
import "./groupdesign/Tab.css";
import { useParams } from "react-router-dom";
import GroupPostList from "../groups/GroupPosts";
import Pendingrequest from "./Pendingrequest";
import GroupPostForm from "./GroupPostForm";
import InviteUser from "./InviteUser";
import GroupInfo from "./Groupinfo";

export default function Tabs({ user, onLike }) {
  const { groupId } = useParams();
  const numericGroupId = Number(groupId);

  const [activeTab, setActiveTab] = useState("groups");
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const [repliesByPostId, setRepliesByPostId] = useState({});
  const [members, setMembers] = useState([]);
  const [groupDescription, setGroupDescription] = useState("");
  const [groupName, setGroupName] = useState("");
  const [loadingDesc, setLoadingDesc] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  // 🔹 Fetch group description and members
  const fetchGroupInfo = async () => {
    if (!groupId) return;
    try {
      const res = await fetch(`${API_URL}/get_group_info.php?group_id=${numericGroupId}`);
      const data = await res.json();
      if (data.success) {
        setGroupDescription(data.group.description || "No description available.");
        setGroupName(data.group.name || "Untitled Group");
        setMembers(data.group.members || []);
      } else {
        setGroupDescription("Failed to load group info.");
      }
    } catch (err) {
      console.error("Error fetching group info:", err);
      setGroupDescription("Error loading group info.");
    } finally {
      setLoadingDesc(false);
    }
  };

  // 🔹 Fetch posts
  const fetchPosts = async () => {
    if (!groupId || !user?.id) return;
    try {
      const res = await fetch(
        `${API_URL}/get_group_posts.php?group_id=${numericGroupId}&user_id=${user.id}`
      );
      const data = await res.json();
      if (data.success) updateStateFromPosts(data.posts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchGroupInfo();
  }, [groupId, numericGroupId, user]);

  // 🔹 Helper: update likes, replies, posts state
  const updateStateFromPosts = (newPosts) => {
    setPosts(newPosts);

    const likeCounts = {};
    const likedStatus = {};
    const repliesMap = {};

    newPosts.forEach((post) => {
      const postKey = `post_${post.id}`;
      likeCounts[postKey] = post.like_count || 0;
      likedStatus[postKey] = post.user_liked || false;

      const replies = post.replies || [];
      repliesMap[post.id] = replies;

      replies.forEach((reply) => {
        const replyKey = `reply_${reply.id}`;
        likeCounts[replyKey] = reply.like_count || 0;
        likedStatus[replyKey] = reply.user_liked || false;
      });
    });

    setLikes(likeCounts);
    setUserLiked(likedStatus);
    setRepliesByPostId(repliesMap);
  };

  // 🔹 Add new post instantly (no refresh)
  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    updateStateFromPosts([newPost, ...posts]);
  };

  // 🔹 Add new reply instantly
  const handleNewReply = (postId, newReply) => {
    setRepliesByPostId((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newReply],
    }));
  };

  // 🔹 Toggle like instantly
  const handleLikeToggle = (itemKey, isLiked) => {
    setLikes((prev) => ({
      ...prev,
      [itemKey]: (prev[itemKey] || 0) + (isLiked ? 1 : -1),
    }));
    setUserLiked((prev) => ({
      ...prev,
      [itemKey]: isLiked,
    }));
  };

  return (
    <div className="tabs-container">
      <GroupInfo groupId={groupId} members={members || []} user ={user}/>

      {/* Tab headers */}
      <div className="tab-header">
        <button
          className={activeTab === "groups" ? "active" : ""}
          onClick={() => setActiveTab("groups")}
        >
          Discussion
        </button>
        <button
          className={activeTab === "members" ? "active" : ""}
          onClick={() => setActiveTab("members")}
        >
          Members
        </button>

        {user?.role === "admin" && (
          <button
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => setActiveTab("pending")}
          >
            Pending Requests
          </button>
        )}

       
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === "groups" && (
          <>
            {/* Post Form */}
            <div
              style={{
                display: "flex",
                gap: "1px",
                alignItems: "flex-start",
                maxWidth: "auto",
              }}
            >
              {user && groupId ? (
                <GroupPostForm
                  user={user}
                  groupId={groupId}
                  onPostAdded={handleNewPost}
                />
              ) : (
                <p style={{ color: "red" }}>
                  Please log in and select a group to post.
                </p>
              )}
            </div>

            {/* Posts */}
            <GroupPostList
              groupId={numericGroupId}
              user={user}
              posts={posts}
              likes={likes}
              userLiked={userLiked}
              repliesByPostId={repliesByPostId}
              onReplyAdded={handleNewReply}
              onLikeToggle={handleLikeToggle}
              onRefresh={fetchPosts}
            />
          </>
        )}

        {activeTab === "members" && (
          <InviteUser groupId={numericGroupId} user={user} adminId={user.id} />
        )}

        {activeTab === "pending" && user?.role === "admin" && (
          <div>
            <h3>Pending Requests</h3>
            <Pendingrequest
              groupId={numericGroupId}
              user={user}
              adminId={user.id}
              showRequests={true}
            />
          </div>
        )}

        {activeTab === "description" && (
          <div className="description-tab">
            <h3>{groupName}</h3>
            {loadingDesc ? (
              <p>Loading description...</p>
            ) : (
              <p>{groupDescription}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
