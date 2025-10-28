import React, { useState, useEffect, useRef } from 'react';
import GroupPostForm from './GroupPostForm';
import { useParams } from 'react-router-dom';
import GroupPostCard from './GroupPostcard';
import LikeButtons from '../icon/LikeButton'
import UnLikeButtons from '../icon/unlikebutton';
import Replybutton from '../icon/replybutton';
import InviteUser from './InviteUser';
import DeleteButtons from '../icon/deleteicon';
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Modal from 'react-modal';
import { AnimatePresence, color, motion } from 'framer-motion';


const ReplyForm = ({ onSubmit }) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    onSubmit(text, files);
    setText("");
    setFiles([]);
    e.target.reset();
  };

  return (
    <form
      onSubmit={submit}
      style={{
        marginTop: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <textarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Write a reply..."
  style={{
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
    width: '100%', // Optional: add width for better display
    minHeight: '80px', // Optional: set a minimum height
    resize: 'vertical', // Optional: allow user to resize vertically
  }}
/>

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
        style={{
          border: "2px dashed #aaa",
          padding: 20,
          textAlign: "center",
          borderRadius: 10,
          cursor: "pointer",
          backgroundColor: "#f9f9f9",
        }}
      >
        Drag & drop media files here, or click to select
        <input
          type="file"
          name="media[]"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </div>

      {/* File preview */}
      {files.length > 0 && (
        <div style={{ fontSize: 14 }}>
          <strong>Selected files:</strong>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "8px",
            }}
          >
            {files.map((file, index) => {
              const isImage = file.type.startsWith("image/");
              const isVideo = file.type.startsWith("video/");

              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "6px",
                    width: "100px",
                    height: "100px",
                    textAlign: "center",
                  }}
                >
                  {isImage && (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  )}

                  {isVideo && (
                    <video
                      src={URL.createObjectURL(file)}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "4px",
                        objectFit: "cover",
                      }}
                      controls
                    />
                  )}

                  {!isImage && !isVideo && (
                    <div style={{ fontSize: "12px", padding: "20px 0" }}>
                      📄 {file.name}
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => {
                      setFiles((prev) => prev.filter((_, i) => i !== index));
                    }}
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="submit"
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "8px 16px",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Submit Reply
      </button>
    </form>
  );
};

const GroupPosts = ({ user, onRefresh }) => {
  const { groupId } = useParams();
  const [posts, setPosts] = useState([]);
const [visibleReplyForms, setVisibleReplyForms] = useState({});
  const [expandedContent, setExpandedContent] = useState({});
  const [likes, setLikes] = useState({});
 const [userLiked, setUserLiked] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [loadingReply, setLoadingReply] = useState(false);
const [popupPhoto, setPopupPhoto] = useState(null);
  const [showFullContent, setShowFullContent] = useState(false);
const [expandedPostId, setExpandedPostId] = useState(null);
  const closePopup = () => setPopupPhoto(null);
const toggleContent = () => setShowFullContent(prev => !prev);
   const [popupImage, setPopupImage] = useState(null);
const [repliesByPostId, setRepliesByPostId] = useState({});
const [nestedReplyMedia, setNestedReplyMedia] = useState({});
  const openImagePopup = (url) => setPopupImage(url);
const [showAllImages, setShowAllImages] = useState({}); // key by reply.id
const [replyContents, setReplyContents] = useState({});
  const [mediaFiles, setMediaFiles] = useState({});
  const [showReplyBox, setShowReplyBox] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
const [replies, setReplies] = useState({});

const [showNestedReplies, setShowNestedReplies] = useState({});
  const [visibleReplies, setVisibleReplies] = useState({});

const [nestedReplyFiles, setNestedReplyFiles] = useState({});
  const scrollRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState({});
  const [nestedReplyText, setNestedReplyText] = useState({});
   const API_URL= process.env.REACT_APP_API_URL;

const Arrow = ({ onClick, direction }) => (
  <div
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '50%',
      [direction]: 10,
      transform: 'translateY(-50%)',
      zIndex: 2,
      backgroundColor: '#fff',
      borderRadius: '50%',
      padding: 8,
      boxShadow: '0 0 8px rgba(0,0,0,0.1)',
      cursor: 'pointer',
    }}
  >
    {direction === 'left' ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
  </div>
);


  const toggleReplies = (postId) => {
  setShowReplies((prev) => ({
    ...prev,
    [postId]: !prev[postId],
  }));
};
  const toggleReplyForm = (postId) => {
  setVisibleReplyForms((prev) => ({
    ...prev,
    [postId]: !prev[postId],
  }));
};
  // ✅ Main fetchPosts function (now exists!)
 const fetchPosts = async () => {
  try {
    const res = await fetch(`${API_URL}/get_group_posts.php?group_id=${groupId}&user_id=${user.id}`);
    const data = await res.json();

    if (data.success) {
      setPosts(data.posts);

      const likeCounts = {};
      const likedStatus = {};
      const repliesMap = {};

      for (const post of data.posts) {
        const postKey = `post_${post.id}`;
        likeCounts[postKey] = post.like_count || 0;
        likedStatus[postKey] = post.user_liked || false;

        // Replies (if they are already included in the response)
        const replies = post.replies || [];
        repliesMap[post.id] = replies;

        for (const reply of replies) {
          const replyKey = `reply_${reply.id}`;
          likeCounts[replyKey] = reply.like_count || 0;
          likedStatus[replyKey] = reply.user_liked || false;
        }
      }

      setLikes(likeCounts);
      setUserLiked(likedStatus);
      setRepliesByPostId(repliesMap);
    }
  } catch (err) {
    console.error('Error fetching posts:', err);
  }
};

useEffect(() => {
  if (groupId && user?.id) {
    fetchPosts();
  }
}, [groupId, user]);

const [activeReplyBox, setActiveReplyBox] = useState(null);

const handleNestedReplySubmit = async (postId, parentId) => {
  const text = nestedReplyText?.[parentId]?.trim() || "";
  const hasMedia =
    (nestedReplyFiles?.[parentId] && nestedReplyFiles[parentId].length > 0) ||
    false;

  if (!text && !hasMedia) {
    alert("Please write a reply or attach media.");
    return;
  }

  const formData = new FormData();
  formData.append("post_id", postId);
  formData.append("group_id", groupId); // ✅ must exist in your component
  formData.append("user_id", user.id);
  formData.append("content", text);
  formData.append("username", user.username);
  formData.append("country", user.country);
  formData.append("parent_id", parentId);

  if (hasMedia) {
    nestedReplyFiles[parentId].forEach((file) =>
      formData.append("media[]", file)
    );
  }

  try {
    const res = await fetch(`${API_URL}/group_post_reply.php`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (result.success) {
      // ✅ clear nested reply input
      setNestedReplyText((prev) => ({ ...prev, [parentId]: "" }));
      setNestedReplyFiles((prev) => ({ ...prev, [parentId]: [] }));
      onRefresh();
      console.log("Nested reply added:", result);
    } else {
      alert(result.message || "Failed to post reply.");
    }
  } catch (err) {
    console.error("Error submitting nested reply:", err);
    alert("Network error while posting reply.");
  }
};

const handleReplyChange = (postId, value) => {
  setReplyContents((prev) => ({ ...prev, [postId]: value }));
  setErrors((prev) => ({ ...prev, [postId]: '' }));
};


const handleReplySubmit = async (postId) => {
  const replyText = replyContents[postId]?.trim();
  const hasMedia = mediaFiles[postId] && mediaFiles[postId].length > 0;

  // Validate input
  if (!replyText && !hasMedia) {
    setErrors((prev) => ({ ...prev, [postId]: 'Please write a reply or attach media.' }));
    return;
  }

  setLoading((prev) => ({ ...prev, [postId]: true }));

  // Prepare FormData
  const formData = new FormData();
  formData.append('post_id', postId);
  formData.append('user_id', user.id);
  formData.append('text', replyText || '');

  if (hasMedia) {
    mediaFiles[postId].forEach((file) => formData.append('media[]', file));
  }

  try {
    // Submit reply
    const res = await fetch(`${API_URL}/add_reply.php`, { method: 'POST', body: formData });
    const rawText = await res.text();
    let data;

    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Invalid JSON:', rawText);
      alert('Server returned invalid response. See console for details.');
      return;
    }

    if (data.success) {
      // Clear input and media
      setReplyContents((prev) => ({ ...prev, [postId]: '' }));
      setMediaFiles((prev) => ({ ...prev, [postId]: [] }));
      setShowReplyBox((prev) => ({ ...prev, [postId]: false }));
      setShowReplies((prev) => ({ ...prev, [postId]: true }));

      // Optionally refresh the entire post list
      onRefresh();

      // Fetch latest replies for this post
      try {
        const resReplies = await fetch(`${API_URL}/get_replies.php?postId=${postId}`);
        const replyData = await resReplies.json();

        if (replyData.success) {
          setReplies((prev) => ({ ...prev, [postId]: replyData.replies }));

          // Smooth scroll to the new reply
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          console.warn('Failed to refresh replies:', replyData.message);
        }
      } catch (refreshErr) {
        console.error('Error refreshing replies:', refreshErr);
      }
    } else {
      alert(data.message || 'Reply submission failed');
    }
  } catch (err) {
    console.error('Network error:', err);
    alert('Network or server error: ' + err.message);
  } finally {
    setLoading((prev) => ({ ...prev, [postId]: false }));
  }
};


const handleDeleteReply = async (replyId, groupId) => {
  if (window.confirm("Are you sure you want to delete this reply?")) {
    try {
      const formData = new FormData();
      formData.append('reply_id', replyId);
      // New line to send the group_id to the backend
      formData.append('group_id', groupId);

      const response = await fetch(`${API_URL}/delete_reply_group.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message); fetchPosts(); // ✅ now this works!
        onRefresh();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Failed to delete reply:", error);
   
    }
  }
};

  // ✅ Handle reply
  const handleReply = async (postId, replyContent, files) => {
    if (!user) return alert("Login required to reply.");

    try {
      const formData = new FormData();
      formData.append("post_id", postId);
      formData.append("group_id", groupId);
      formData.append("user_id", user.id);
      formData.append("content", replyContent);
      formData.append("username", user.username);
      formData.append("country", user.country);

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("media[]", file);
        });
      }

      const res = await fetch(`${API_URL}/group_post_reply.php`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) fetchPosts(); // ✅ now this works!
      else alert(data.message || "Reply failed.");
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };



const formatDate = (timestamp) => {
  const targetTimeZone = "Asia/Manila";
  const date = new Date(timestamp); // let JS parse it

  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: targetTimeZone
  }).format(date);
};



const handleLike = async (id, groupId, type = 'post') => {
  const key = `${type}_${id}`;
  const liked = userLiked[key];
  const url = liked ? 'unlike_group_post.php' : 'like_group_post.php';

  try {
    const res = await fetch(`${API_URL}/${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        user_id: user.id,
        target_id: id,
        group_id: groupId,
        target_type: type
      })
    });

    const data = await res.json();
    if (data.success) {
      setLikes(prev => ({
        ...prev,
        [key]: liked ? Math.max(0, (prev[key] || 1) - 1) : (prev[key] || 0) + 1
      }));
      setUserLiked(prev => ({
        ...prev,
        [key]: !liked
      }));
    } else {
      console.warn(data.message);
    }
  } catch (err) {
    console.error('Like/unlike request failed:', err.message);
  }
};
const handleDelete = async (postId) => {
  if (!postId || isNaN(postId)) {
    alert("❌ Invalid post ID.");
    return;
  }

  if (!window.confirm("Are you sure you want to delete this post?")) return;

  try {
    const formData = new FormData();
    formData.append('post_id', postId);

    const response = await fetch(`${API_URL}/delete_groupPost.php`, {
      method: 'POST',
      body: formData,
    });

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch (parseErr) {
      console.error("❌ Response is not valid JSON. Raw response:");
      console.error(text); // likely HTML error
      alert("❌ Server returned an invalid response. Check console for details.");
      return;
    }

    if (result.success) {

      
     alert("Post deleted successfully!");
      fetchPosts(); // ✅ refresh posts after deletion
    } else {
      alert("❌ Delete failed: " + (result.message || "Unknown error."));
    }
  } catch (err) {
    console.error("❌ Error while deleting post:", err);
    alert("❌ A network error occurred. See console for details.");
  }
};

const isImage = (url) => /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
const isVideo = (url) => /\.(mp4|mov|avi|webm)$/i.test(url);
const isAudio = (url) => /\.(mp3|wav|ogg)$/i.test(url);
const isDocument = (url) => /\.(pdf|docx?|pptx?|xlsx?)$/i.test(url);

const getMimeType = (url) => {
  if (isVideo(url)) return 'video/mp4';
  if (isAudio(url)) return 'audio/mpeg';
  if (isDocument(url)) return 'application/pdf';
  return 'application/octet-stream';
};;

const createLinkifiedText = (text) => {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb">$1</a>'
  );
};


  return (
<div className="post-list" style={{ maxWidth: '800px', margin: 'auto', padding: '20px 10px 100px 5px' }}>

 
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
         <div
        key={post.id}
        className="post-card"
      style={{
borderRadius: window.innerWidth <= 768 ? '0' : '16px',
padding: '20px',
marginBottom: '10px',
backgroundColor: '#ffffff',
boxShadow: '20px 20px 20px rgba(5, 4, 4, 0.05)',
borderTop: '1px solid #eaeaea',
borderBottom: '1px solid #eaeaea',
borderLeft: window.innerWidth <= 768 ? 'none' : '1px solid #eaeaea',
borderRight: window.innerWidth <= 768 ? 'none' : '1px solid #eaeaea',
transition: 'all 0.3s ease',
width: window.innerWidth <= 768 ? '100vw' : 'auto', // ✅ full edge width
marginLeft: window.innerWidth <= 768 ? '50%' : 'auto', // ✅ center alignment
transform: window.innerWidth <= 768 ? 'translateX(-50%)' : 'none', // ✅ prevents overflow
marginRight: 'auto',
}}


      >

      <div style={{ position: 'relative' }}>
      
      
     {user && (Number(user.id) === Number(post.user_id) || user.role === "admin") && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => setShowDropdown((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#555',
                padding: '6px',
              }}
            >
              ⋮
            </button>
      
            {showDropdown?.[post.id] && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '30px',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  minWidth: '120px',
                  zIndex: 1001,
                }}
              >
      
               
                <button
                  onClick={() => {
                    handleDelete(post.id);
                    setShowDropdown((prev) => ({ ...prev, [post.id]: false }));
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                  onMouseOver={(e) => (e.target.style.background = '#fef2f2')}
                  onMouseOut={(e) => (e.target.style.background = 'none')}
                >
                Delete
                </button>
                
                
                
              </div>
            )}
          </div>
        </div>
      )}
      
            {/* Header */}
            <div>
       <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#102a43',
        marginBottom: '16px'
      }}>
  
              {post.title}

              
     
      </h2>
              <div style={{ fontSize: 12, color: '#666' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <img
  src={post.profile_picture || `${API_URL}/uploads/default-avatar.png`}
  alt="avatar"
  style={{
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '12px',
  }}
  onError={(e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = `${API_URL}/uploads/default-avatar.png`;
  }}
/>
                   <div>
                     <div style={{ fontWeight: 600 }}>{post.first_name} {post.last_name}</div>
                     <div style={{ fontSize: '12px', color: '#6b7280' }}>
                       {formatDate(post.created_at)} · {post.category} · {post.country}
                     </div>
                   </div>
                 </div>
            </div>

        {/* 🔹Content */}
          <p
          style={{
            fontSize: "15px",
            color: "#374151",
            marginBottom: "8px",
            whiteSpace: "pre-wrap",
          }}
          dangerouslySetInnerHTML={{
            __html:
              expandedContent[post.id] || post.content.split(" ").length <= 50
                ? createLinkifiedText(String(post.content))
                : createLinkifiedText(
                    String(post.content).split(" ").slice(0, 50).join(" ") + "..."
                  ),
          }}
          
        ></p>
      
      {post.content.split(' ').length > 50 && (
        <button
          onClick={() =>
            setExpandedContent((prev) => ({
              ...prev,
              [post.id]: expandedContent[post.id] ? null : post.content
            }))
          }
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            fontSize: '14px',
            padding: 0
          }}
        >
          {expandedContent[post.id] ? 'See less' : 'See more'}
        </button>
      )}
  <>
<div>
      {/* Single media */}
      {Array.isArray(post.media) && post.media.length === 1 && (
        <div
          style={{
            borderRadius: '10px',
            overflow: 'hidden',
            marginTop: '12px',
            height: '500px',
            maxwidth: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f9f9f9',
            position: 'relative',
            cursor: isImage(post.media[0].url) ? 'pointer' : 'default',
          }}
          onClick={() => isImage(post.media[0].url) && setPopupPhoto(post.media[0].url)}
        >
          {isImage(post.media[0].url) ? (
            <>
              <img
                src={post.media[0].url}
                alt="media"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
              <div
                className="hover-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  pointerEvents: 'none',
                }}
              >
                View Photo
              </div>
            </>
          ) : isVideo(post.media[0].url) ? (
            <video controls style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}>
          
               <source src={post.media[0].url} type={getMimeType(post.media[0].url)} />
            </video>
          ) : null}
          <style>
            {`
              div:hover > .hover-overlay {
                opacity: 1;
                pointer-events: auto;
              }
            `}
          </style>
          {popupPhoto && (
  <div
    onClick={() => setPopupPhoto(null)}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      cursor: 'pointer',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{ position: 'relative', cursor: 'default' }}
    >
      <img
        src={popupPhoto}
        alt="popup"
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          display: 'block',
        }}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPopupPhoto(null);
        }}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '8px 12px',
          fontSize: '24px',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '0 10px 0 10px',
          userSelect: 'none',
          zIndex: 1001,
        }}
      >
       ❌
      </button>
    </div>
  </div>
)}


        </div>
      )}

       {/* double media */}
     {Array.isArray(post.media) && post.media.length === 2 && (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',   // ⇦ two equal columns
      height: 400,                      // ⇦ total height (change to 500, 600…)
      gap: 12,
      marginTop: 12,
      width: '100%',
    }}
  >
    {post.media.map((file, idx) => {
      const isImg = isImage(file.url);
      const isVid = isVideo(file.url);

      return (
        <div
          key={idx}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 10,
            overflow: 'hidden',
            background: '#f9f9f9',
            cursor: isImg ? 'pointer' : 'default',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => isImg && setPopupPhoto(file.url)}
        >
          {isImg ? (
            <>
              <img
                src={file.url}
                alt={`media-${idx}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',    // fill the box
                }}
              />
              <div className="hover" />
            </>
          ) : isVid ? (
            <video
              controls
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
        <source src={file.url} type={getMimeType(file.url)} />
            </video>
          ) : null}
        </div>
      );
    })}

    {/* hover effect */}
    <style>{`
      .hover {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.35);
        color: #fff;
        font-size: 22px;
        font-weight: 600;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity .25s;
        border-radius: 10px;
        pointer-events: none;
      }
      div:hover > .hover {
        opacity: 1;
        pointer-events: auto;
      }
    `}</style>

    {popupPhoto && (
      <div
        onClick={() => setPopupPhoto(null)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          cursor: 'pointer',
        }}
      >
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
          <img
            src={popupPhoto}
            alt="popup"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 10,
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}
          />
          <button
            onClick={() => setPopupPhoto(null)}
            style={{
              position: 'absolute',
              top: 6,
              right: 8,
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ❌
          </button>
        </div>
      </div>
    )}
  </div>
)}


{Array.isArray(post.media) && post.media.length === 3 && (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gridTemplateAreas: `
        "leftTop  right"
        "leftBot  right"
      `,
      gap: 12,
      marginTop: 12,
      width: '100%',
      height: '600px', // Change to 500px, etc. if needed
    }}
  >
    {post.media.map((file, idx) => {
      const isImg = isImage(file.url);
      const isVid = isVideo(file.url);

      const area =
        idx === 0 ? 'leftTop' :
        idx === 1 ? 'leftBot' : 'right';

      return (
        <div
          key={idx}
          style={{
            gridArea: area,
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 10,
            overflow: 'hidden',
            background: '#eee',
            cursor: isImg ? 'pointer' : 'default',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => isImg && setPopupPhoto(file.url)}
        >
          {isImg ? (
            <>
              <img
                src={file.url}
                alt={`media-${idx}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div className="hover" />
            </>
          ) : isVid ? (
            <video
              controls
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
         <source src={file.url} type={getMimeType(file.url)} />
            </video>
          ) : null}
        </div>
      );
    })}

    {/* Hover effect */}
    <style>{`
      .hover {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.35);
        color: #fff;
        font-size: 22px;
        font-weight: 600;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity .25s;
        border-radius: 10px;
        pointer-events: none;
      }
      div:hover > .hover {
        opacity: 1;
        pointer-events: auto;
      }
    `}</style>

    {/* Popup viewer */}
 {popupPhoto && (
  <div
    onClick={() => setPopupPhoto(null)}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', // ✅ make background slightly dark
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      cursor: 'pointer',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'relative',
        cursor: 'default',
      }}
    >
      <img
        src={popupPhoto}
        alt="popup"
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          display: 'block',
        }}
      />

      {/* ✅ CLEAR VISIBLE CLOSE BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPopupPhoto(null);
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '6px 10px',
          fontSize: '12px',
          background: 'rgba(0, 0, 0, 0.6)',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 2100,
          lineHeight: 1,
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
      >
        ❌
      </button>
    </div>
  </div>
)}
  </div>
)}





      {/* Multiple media */}
    {Array.isArray(post.media) && post.media.length > 3 && (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        marginTop: '12px',
      }}
    >
      {(expandedPostId === post.id ? post.media : post.media.slice(0, 4)).map((mediaItem, idx) => {
        const isLast = idx === 3 && post.media.length > 4 && expandedPostId !== post.id;
        return (
          <div
            key={`${post.id}-${idx}`} // stable unique key
            style={{
              position: 'relative',
              borderRadius: '10px',
              overflow: 'hidden',
              aspectRatio: '1 / 1',
              backgroundColor: '#f9f9f9',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: isImage(mediaItem.url) ? 'pointer' : 'default',
            }}
            onClick={() => isImage(mediaItem.url) && setPopupPhoto(mediaItem.url)}
          >
            {isImage(mediaItem.url) ? (
              <>
                <img
                  src={mediaItem.url}
                  alt="media"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <div
                  className="hover-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    borderRadius: '10px',
                    pointerEvents: 'none',
                  }}
                >
                  View Photo
                </div>
              </>
            ) : isVideo(mediaItem.url) ? (
              <video
                controls
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} // fill the cell
              >
                <source src={mediaItem.url} type={getMimeType(mediaItem.url)} />
                Your browser does not support this video format.
              </video>
            ) : null}
  
            {isLast && (
              <div
                onClick={() => setExpandedPostId(post.id)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  fontSize: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: '10px',
                }}
              >
                +{post.media.length - 4}
              </div>
            )}
            <style>{`
              div:hover > .hover-overlay {
                opacity: 1;
                pointer-events: auto;
              }
            `}</style>
          </div>
        );
      })}
    </div>
  )}

      {/* Show less */}
      {post.media && (
  <>
    {/* Display only 4 media items initially */}
    

    {/* Show the "See more" or "Show less" button if there are more than 4 media items */}
    {post.media.length > 4 && (
      <button
        onClick={() => setExpandedPostId(prev => (prev === post.id ? null : post.id))}
        style={{
          marginTop: '10px',
          background: 'none',
          border: 'none',
          color: '#0077cc',
          fontSize: '14px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {expandedPostId === post.id ? 'Show less' : 'See more photos'}
      </button>
    )}
  </>
)}

      {/* Popup */}
      {popupPhoto && (
        <div
          onClick={closePopup}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            cursor: 'pointer',
          }}
        >
          <img
            src={popupPhoto}
            alt="popup"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '10px',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
    </>
 {/* Like and Share */}

            
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 15 }}>
  {/* Reply Button */}
  <button
    onClick={() => toggleReplyForm(post.id)}
    style={{
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }}
  >
 
    {/* ✅ Label changes dynamically */}
    <span style={{ color: '#0284c7', fontWeight: '500', fontSize: '14px' }}>
      {visibleReplyForms[post.id] ? 'Cancel Reply' :  <Replybutton />}
    </span>
  </button>

  {/* Like Button */}
  <button
    onClick={() => handleLike(post.id, post.group_id)}
    style={{
      background: 'transparent',
      color: userLiked[`post_${post.id}`] ? '#0284c7' : '#374151',
      border: 'none',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
      padding: '4px 8px',
    }}
  >
    {userLiked[`post_${post.id}`] ? <LikeButtons /> : <UnLikeButtons />}
    {likes[`post_${post.id}`] || 0}
  </button>
</div>

{/* Reply Form */}
{visibleReplyForms[post.id] && (
  <div style={{ margin: 30 }}>
    <ReplyForm
      onSubmit={(text, file) => {
        handleReply(post.id, text, file);
        // ✅ Automatically close the reply form after submitting
        toggleReplyForm(post.id);
      }}
    />
  </div>
)}
{/* View/Hide Replies */}
{post.replies && post.replies.length > 0 && (
  <div style={{ marginTop: 10 }}>
    <button
      onClick={() => toggleReplies(post.id)}
      style={{
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        padding: 0,
        fontSize: 14,
      }}
    >
      {showReplies[post.id]
        ? 'Hide Replies'
        : `View Replies (${post.replies.length})`}
    </button>
  </div>
)}


{/* Replies List */}
{showReplies[post.id] &&
  post.replies.map((reply) => (
    <div
      key={reply.id}
      style={{
        marginTop: 10,
        paddingLeft: 10,
        borderLeft: '3px solid #eee',
        marginBottom: 16,
      }}
    >
      {/* Reply Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
        <img
          src={reply.profile_picture}
          alt="avatar"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: 8,
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              `${API_URL}/uploads/default-avatar.png`;
          }}
        />
       <div>
  <div style={{ fontSize: "0.8rem", color: "gray" }}>    

<strong>{reply.first_name} {reply.last_name}</strong>
  </div>
   {formatDate(reply.created_at)} 
</div>

        
      </div>

      {/* Reply Content */}

<p
  style={{
    fontSize: "15px",
    color: "#374151",
    marginBottom: "8px",
    whiteSpace: "pre-wrap",
  }}
  dangerouslySetInnerHTML={{
    __html:
      expandedContent[reply.id] || reply.content.split(" ").length <= 50
        ? createLinkifiedText(String(reply.content))
        : createLinkifiedText(
            String(reply.content).split(" ").slice(0, 50).join(" ") + "..."
          ),
  }}
></p>

{reply.content.split(" ").length > 50 && (
  <button
    onClick={() =>
      setExpandedContent((prev) => ({
        ...prev,
        [reply.id]: prev[reply.id] ? false : true, // store as boolean
      }))
    }
    style={{
      background: "none",
      border: "none",
      color: "#2563eb",
      cursor: "pointer",
      fontSize: "14px",
      padding: 0,
    }}
  >
    {expandedContent[reply.id] ? "See less" : "See more"}
  </button>
)}



      {/* Reply Media */}
            {Array.isArray(reply.media) && (
  <>
    {reply.media
      .slice(0, showAllImages[reply.id] ? reply.media.length : 2)
      .map((item, idx) => {
        const isImg = isImage(item.url);
        const isVid = isVideo(item.url);

        return isImg ? (
          <img
            key={idx}
            src={item.url}
            alt="reply media"
            style={{
              margin: '15px',
              maxWidth: '50%',
              borderRadius: '4px',
              marginTop: '10px',
              objectFit: 'contain',
            }}
          />
        ) : isVid ? (
          <video
            key={idx}
            controls
            playsInline
            style={{
              background: 'none',
              border: 'none',
              margin: '15px',
              maxWidth: '50%',
              borderRadius: '4px',
              marginTop: '10px',
              objectFit: 'contain',
            }}
          >
            <source src={item.url} type={getMimeType(item.url)} />
            Your browser does not support this video format.
          </video>
        ) : null;
      })}

    {reply.media.length > 2 && (
      <button
        onClick={() =>
          setShowAllImages((prev) => ({
            ...prev,
            [reply.id]: !prev[reply.id],
          }))
        }
        style={{
          width: '120px',
          border: 'none',
          background: '#f9f9f9',
          borderRadius: '6px',
          padding: '8px',
          color: '#0077b6',
          marginTop: '10px',
          cursor: 'pointer',
        }}
      >
        {showAllImages[reply.id] ? 'Show less' : 'See more media'}
      </button>
    )}
  </>
)}



      {/* Like Button for Reply */}
     <div style={{
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1px'
}}>
  {/* Like button */}
  <button      onClick={() => handleLike(reply.id, post.group_id, 'reply')}

    style={{
      fontSize: '13px',
      color: userLiked[`reply_${reply.id}`] ? '#0077b6' : '#555',
      fontWeight: 'bold',
      background: 'transparent',
      border: 'none',
      padding: '4px 10px',
      borderRadius: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}
  >
    <span style={{ fontSize: '15px' }}></span>
    <span>
      {userLiked[`reply_${reply.id}`] ? <LikeButtons /> : <UnLikeButtons />}
    </span>
    <span style={{ color: '#666' }}>
      {likes[`reply_${reply.id}`] || 0}
    </span>
  </button>

  {/* Delete button (conditionally rendered) */}
  {
    (user && (Number(user.id) === Number(reply.user_id) || user.role === 'admin')) && (
      <button
        onClick={() => handleDeleteReply(reply.id, post.group_id)}
        style={{
          fontSize: '13px',
          color: '#d9534f',
          fontWeight: 'bold',
          background: 'transparent',
          border: 'none',
          padding: '4px 10px',
          borderRadius: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <DeleteButtons/>
      </button>
    )
  }
    <button
                    onClick={() =>
                      setActiveReplyBox((prev) =>
                        prev === reply.id ? null : reply.id
                      )
                    }
                    style={{
                      fontSize: "13px",
                      color: "#0077b6",
                      fontWeight: "bold",
                      background: "transparent",
                      border: "none",
                      padding: "4px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Reply

                  </button>
           
      {activeReplyBox === reply.id && (
  <div style={{ marginTop: "8px" }}>
    {/* Reply input  <img
        src={user.profile_picture || "/default-avatar.png"}
        alt="avatar"
        style={{ width: "35px", height: "35px", borderRadius: "50%" }}
      />*/}
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
     
      <div style={{ flex: 1 }}>
        <textarea
          rows="2"
          placeholder="Write a reply..."
          value={nestedReplyText[reply.id] || ""}
          onChange={(e) =>
            setNestedReplyText((prev) => ({
              ...prev,
              [reply.id]: e.target.value,
            }))
          }
          style={{
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #ddd",
            padding: "6px",
            fontSize: "13px",
          }}
        />
        {/* Media input */}
<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setNestedReplyMedia((prev) => ({
      ...prev,
      [reply.id]: [...(prev[reply.id] || []), ...files],
    }));
  }}
  onClick={() => document.getElementById(`nested-upload-${reply.id}`).click()}
  style={{
    marginTop: "6px",
    padding: "10px",
    border: "2px dashed #0077b6",
    borderRadius: "8px",
    textAlign: "center",
    cursor: "pointer",
    color: "#0077b6",
    fontSize: "14px",
    position: "relative",
  }}
>
  Drag & Drop files here or click to select
  <input
    type="file"
    id={`nested-upload-${reply.id}`}
    multiple
    style={{ display: "none" }}
    onChange={(e) => {
      const files = Array.from(e.target.files);
      setNestedReplyMedia((prev) => ({
        ...prev,
        [reply.id]: [...(prev[reply.id] || []), ...files],
      }));
    }}
  />
</div>

{/* Preview selected files */}
<div style={{ display: "flex", flexWrap: "wrap", marginTop: "10px", gap: "10px" }}>
  {(nestedReplyMedia[reply.id] || []).map((file, idx) => {
    const url = URL.createObjectURL(file);
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    return (
      <div key={idx} style={{ position: "relative" }}>
        {isImage && (
          <img
            src={url}
            alt="preview"
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px" }}
          />
        )}
        {isVideo && (
          <video
            src={url}
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px" }}
            controls
          />
        )}
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setNestedReplyMedia((prev) => ({
              ...prev,
              [reply.id]: prev[reply.id].filter((_, i) => i !== idx),
            }));
          }}
          style={{
            position: "absolute",
            top: "-5px",
            right: "-5px",
            background: "#d9534f",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    );
  })}
</div>
        <div style={{ marginTop: "6px" }}>
          <button
            onClick={() => handleNestedReplySubmit(post.id, reply.id)}
            style={{
              padding: "6px 12px",
              background: "#0077b6",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Send
          </button>
      {showReplies[post.id] && (
  <div style={{ marginTop: "20px" }}>
    <AnimatePresence>
      {(post.replies || [])
        .filter((r) => !r.parent_reply_id) // Only show top-level replies
        .slice(0, visibleReplies[post.id] ?? 7)
        .map((reply, i) => {
          const nestedReplies = (post.replies || []).filter(
            (r) => r.parent_reply_id === reply.id
          );

          return (
            <motion.div
              key={reply.id || i}
              ref={
                i === ((visibleReplies[post.id] ?? 7) - 1)
                  ? scrollRef
                  : null
              }
              initial={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -10 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                gap: "10px",
                borderTop: "1px solid #eee",
                paddingTop: "10px",
                marginTop: "10px",
              }}
            >
              {/* Avatar */}
              <img
                src={reply.profile_picture || "/default-avatar.png"}
                alt="avatar"
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                }}
              />

              {/* Reply content */}
              <div style={{ flex: 1 }}>
                <strong>
                  {reply.first_name} {reply.last_name}
                </strong>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {formatDate(reply.created_at)}
                </div>

                <p
                  style={{
                    fontSize: "15px",
                    color: "#374151",
                    marginBottom: "8px",
                    whiteSpace: "pre-wrap",
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      expandedContent[reply.id] ||
                      reply.text.split(" ").length <= 50
                        ? createLinkifiedText(String(reply.text))
                        : createLinkifiedText(
                            String(reply.text)
                              .split(" ")
                              .slice(0, 50)
                              .join(" ") + "..."
                          ),
                  }}
                ></p>

                {/* --- Media --- */}
                {Array.isArray(reply.media) && reply.media.length > 0 && (
                  <>
                    {reply.media
                      .slice(
                        0,
                        showAllImages[reply.id]
                          ? reply.media.length
                          : 2
                      )
                      .map((item, idx) => {
                        const isImg = isImage(item.url);
                        const isVid = isVideo(item.url);

                        return isImg ? (
                          <img
                            key={idx}
                            src={item.url}
                            alt="reply media"
                            style={{
                              margin: "10px",
                              maxWidth: "50%",
                              borderRadius: "4px",
                              objectFit: "contain",
                            }}
                          />
                        ) : isVid ? (
                          <video
                            key={idx}
                            controls
                            playsInline
                            style={{
                              background: "none",
                              border: "none",
                              margin: "10px",
                              maxWidth: "50%",
                              borderRadius: "4px",
                              objectFit: "contain",
                            }}
                          >
                            <source
                              src={item.url}
                              type={getMimeType(item.url)}
                            />
                          </video>
                        ) : null;
                      })}

                    {reply.media.length > 2 && (
                      <button
                        onClick={() =>
                          setShowAllImages((prev) => ({
                            ...prev,
                            [reply.id]: !prev[reply.id],
                          }))
                        }
                        style={{
                          width: "120px",
                          border: "none",
                          background: "#f9f9f9",
                          borderRadius: "6px",
                          padding: "8px",
                          color: "#0077b6",
                          marginTop: "10px",
                          cursor: "pointer",
                        }}
                      >
                        {showAllImages[reply.id]
                          ? "Show less"
                          : "See more media"}
                      </button>
                    )}
                  </>
                )}

                {/* --- Actions (Like / Delete / Reply) --- */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "4px",
                    marginTop: "5px",
                  }}
                >
                  {/* Like button */}
                  <button
                    onClick={() => handleLike(reply.id, "reply")}
                    style={{
                      fontSize: "13px",
                      color: userLiked[`reply_${reply.id}`]
                        ? "#0077b6"
                        : "#555",
                      fontWeight: "bold",
                      background: "transparent",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {userLiked[`reply_${reply.id}`] ? (
                      <LikeButtons />
                    ) : (
                      <UnLikeButtons />
                    )}
                    <span style={{ color: "#666" }}>
                      {likes[`reply_${reply.id}`] || 0}
                    </span>
                  </button>

                  {/* Delete button */}
                  {user &&
                    (Number(user.id) === Number(reply.user_id) ||
                      user.role === "admin") && (
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        style={{
                          fontSize: "13px",
                          color: "#d9534f",
                          fontWeight: "bold",
                          background: "transparent",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <DeleteButtons />
                      </button>
                    )}

                  {/* ✅ Reply button */}
                  <button
                    onClick={() =>
                      setActiveReplyBox((prev) =>
                        prev === reply.id ? null : reply.id
                      )
                    }
                    style={{
                      fontSize: "13px",
                      color: "#0077b6",
                      fontWeight: "bold",
                      background: "transparent",
                      border: "none",
                      padding: "4px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Reply

                  </button>
                </div>

                {/* ✅ Reply box (for replying to this reply) */}
       {activeReplyBox === reply.id && (
  <div style={{ marginTop: "8px" }}>
    {/* Reply input  <img
        src={user.profile_picture || "/default-avatar.png"}
        alt="avatar"
        style={{ width: "35px", height: "35px", borderRadius: "50%" }}
      />*/}
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
     
      <div style={{ flex: 1 }}>
        <textarea
          rows="2"
          placeholder="Write a reply..."
          value={nestedReplyText[reply.id] || ""}
          onChange={(e) =>
            setNestedReplyText((prev) => ({
              ...prev,
              [reply.id]: e.target.value,
            }))
          }
          style={{
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #ddd",
            padding: "6px",
            fontSize: "13px",
          }}
        />
        {/* Media input */}
<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setNestedReplyMedia((prev) => ({
      ...prev,
      [reply.id]: [...(prev[reply.id] || []), ...files],
    }));
  }}
  onClick={() => document.getElementById(`nested-upload-${reply.id}`).click()}
  style={{
    marginTop: "6px",
    padding: "10px",
    border: "2px dashed #0077b6",
    borderRadius: "8px",
    textAlign: "center",
    cursor: "pointer",
    color: "#0077b6",
    fontSize: "14px",
    position: "relative",
  }}
>
  Drag & Drop files here or click to select
  <input
    type="file"
    id={`nested-upload-${reply.id}`}
    multiple
    style={{ display: "none" }}
    onChange={(e) => {
      const files = Array.from(e.target.files);
      setNestedReplyMedia((prev) => ({
        ...prev,
        [reply.id]: [...(prev[reply.id] || []), ...files],
      }));
    }}
  />
</div>

{/* Preview selected files */}
<div style={{ display: "flex", flexWrap: "wrap", marginTop: "10px", gap: "10px" }}>
  {(nestedReplyMedia[reply.id] || []).map((file, idx) => {
    const url = URL.createObjectURL(file);
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    return (
      <div key={idx} style={{ position: "relative" }}>
        {isImage && (
          <img
            src={url}
            alt="preview"
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px" }}
          />
        )}
        {isVideo && (
          <video
            src={url}
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px" }}
            controls
          />
        )}
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setNestedReplyMedia((prev) => ({
              ...prev,
              [reply.id]: prev[reply.id].filter((_, i) => i !== idx),
            }));
          }}
          style={{
            position: "absolute",
            top: "-5px",
            right: "-5px",
            background: "#d9534f",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    );
  })}
</div>
        <div style={{ marginTop: "6px" }}>
          <button
            onClick={() => handleNestedReplySubmit(post.id, reply.id)}
            style={{
              padding: "6px 12px",
              background: "#0077b6",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Send
          </button>
      
        </div>
      </div>
    </div>
  </div>
)}

                {/* ✅ Nested replies section */}
                  {nestedReplies.length > 0 && (
  <div style={{ marginTop: "10px" }}>
    <button
      onClick={() =>
        setShowNestedReplies((prev) => ({
          ...prev,
          [reply.id]: !prev[reply.id],
        }))
      }
      style={{
        background: "none",
        border: "none",
        color: "#0077b6",
        cursor: "pointer",
        fontSize: "13px",
        padding: 0,
      }}
    >
      {showNestedReplies[reply.id]
        ? "Hide replies"
        : `View ${nestedReplies.length} repl${
            nestedReplies.length > 1 ? "ies" : "y"
          }`}
    </button>

    {showNestedReplies[reply.id] &&
      nestedReplies.map((child) => (
        <div
          key={child.id}
          style={{
            display: "flex",
            gap: "10px",
            marginLeft: "40px",
            marginTop: "8px",
            borderLeft: "2px solid #eee",
            paddingLeft: "10px",
          }}
        >
          {/* Child reply avatar */}
          <img
            src={child.profile_picture || "/default-avatar.png"}
            alt="avatar"
            style={{ width: "30px", height: "30px", borderRadius: "50%" }}
          />

          {/* Child reply content */}
          <div style={{ flex: 1 }}>
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <strong>
      {child.first_name} {child.last_name}
    </strong>
    {/* 🕒 Time Display */}
    {child.created_at && (
      <span
        style={{
          fontSize: "12px",
          color: "#888",
          marginLeft: "6px",
        }}
      >
        {formatDate(child.created_at)}
      </span>
    )}
  </div>

  <p
    style={{
      fontSize: "14px",
      margin: "4px 0",
      color: "#444",
    }}
  >


   <div>
  <p
    style={{
      fontSize: "15px",
      color: "#374151",
      marginBottom: "8px",
      whiteSpace: "pre-wrap",
    }}
    dangerouslySetInnerHTML={{
      __html: createLinkifiedText(
        expandedContent[child.id]
          ? String(child.text)
          : String(child.text)
              .split(" ")
              .slice(0, 50)
              .join(" ") +
            (child.text.split(" ").length > 50 ? "..." : "")
      ),
    }}
  ></p>

  {/* ✅ See more / See less button */}
  {child.text.split(" ").length > 50 && (
    <button
      onClick={() =>
        setExpandedContent((prev) => ({
          ...prev,
          [child.id]: !prev[child.id],
        }))
      }
      style={{
        fontSize: "13px",
        color: "#0077b6",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {expandedContent[child.id] ? "See less" : "See more"}
    </button>
  )}
</div>
  </p>

  {/* 🖼️ Optional: media for nested reply */}
  {Array.isArray(child.media) &&
    child.media.map((item, idx) => {
      const isImg = isImage(item.url);
      const isVid = isVideo(item.url);
      return isImg ? (
        <img
          key={idx}
          src={item.url}
          alt="reply media"
          style={{
            maxWidth: "25%",
            margin: "5px 0",
            borderRadius: "4px",
            objectFit: "contain",
          }}
        />
      ) : isVid ? (
        <video
          key={idx}
          controls
          playsInline
          style={{
            maxWidth: "25%",
            margin: "5px 0",
            borderRadius: "4px",
            objectFit: "contain",
          }}
        >
          <source src={item.url} type={getMimeType(item.url)} />
        </video>
      ) : null;
    })}

  {/* ❤️ Like + 🗑️ Delete buttons */}
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
    <button
      onClick={() => handleLike(child.id, "reply")}
      style={{
        fontSize: "12px",
        color: userLiked[`reply_${child.id}`] ? "#0077b6" : "#555",
        fontWeight: "bold",
        background: "transparent",
        border: "none",
        padding: "4px 8px",
        borderRadius: "20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {userLiked[`reply_${child.id}`] ? <LikeButtons /> : <UnLikeButtons />}
      <span style={{ color: "#666" }}>{likes[`reply_${child.id}`] || 0}</span>
    </button>

    {user && (user.id === child.user_id || user.role === "admin") && (
      <button
        onClick={() => handleDeleteReply(child.id)}
        style={{
          padding: "4px 8px",
          fontSize: "12px",
          background: "none",
          color: "#d9534f",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        <DeleteButtons />
      </button>
    )}
  </div>
</div>


        </div>

        
      ))}
  </div>
)}
              </div>
            </motion.div>
          );
        })}
    </AnimatePresence>
  </div>
)}
        </div>
      </div>
    </div>
  </div>
)}
  
</div>


    </div>
  ))}

      </div>
         
          </div>       </div>
        ))
      )}
    </div>
  );
};

export default GroupPosts;
