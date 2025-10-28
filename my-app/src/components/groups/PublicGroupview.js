// GroupPostsPublicView.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GroupPostForm from './GroupPostForm';
import GroupPostCard from './GroupPostcard';
import LikeButtons from '../icon/LikeButton';
import UnLikeButtons from '../icon/unlikebutton';
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Modal from 'react-modal';

const GroupPosts = ({ user }) => {
  const { groupId } = useParams();
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const [repliesByPostId, setRepliesByPostId] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [expandedContent, setExpandedContent] = useState({});
  const [popupImage, setPopupImage] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const openImagePopup = (url) => setPopupImage(url);
  const closePopup = () => setPopupImage(null);

  const toggleReplies = (postId) => {
    setShowReplies((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/get_group_posts.php?group_id=${groupId}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);

        const likeCounts = {};
        const likedStatus = {};
        const repliesMap = {};

        data.posts.forEach((post) => {
          likeCounts[`post_${post.id}`] = post.like_count || 0;
          likedStatus[`post_${post.id}`] = false; // public view

          const replies = post.replies || [];
          repliesMap[post.id] = replies;

          replies.forEach((reply) => {
            likeCounts[`reply_${reply.id}`] = reply.like_count || 0;
            likedStatus[`reply_${reply.id}`] = false; // public view
          });
        });

        setLikes(likeCounts);
        setUserLiked(likedStatus);
        setRepliesByPostId(repliesMap);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    if (groupId) fetchPosts();
  }, [groupId]);

  const formatTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleLike = async (id, groupId, type = 'post') => {
    if (!user) return; // public view cannot like
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
      }
    } catch (err) {
      console.error('Like/unlike request failed:', err.message);
    }
  };

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

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <Arrow direction="left" />,
    nextArrow: <Arrow direction="right" />,
  };

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
  width: window.innerWidth <= 768 ? '100vw' : 'auto', // 👈 full width to screen edges
  marginLeft: window.innerWidth <= 768 ? '-10px' : '0', // 👈 removes side padding effect if container has it
  marginRight: window.innerWidth <= 768 ? '-10px' : '0',
}}
   
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <img
                src={post.profile_picture || `${API_URL}/uploads/default-avatar.png`}
                alt="avatar"
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginRight: 12 }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{post.username}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {formatTimeAgo(post.created_at)} · {post.category} · {post.country}
                </div>
              </div>
            </div>

            {/* Content */}
           <p
             style={{
               fontSize: "12px",
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
           
           {post.content.split(" ").length > 50 && (
             <button
               onClick={() =>
                 setExpandedContent((prev) => ({
                   ...prev,
                   [post.id]: expandedContent[post.id] ? null : post.content,
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
               {expandedContent[post.id] ? "See less" : "See more"}
             </button>
           )}

            {/* Media Slider */}
            {post.media?.length > 0 && (
              <div style={{ maxWidth: 500, width: '100%', height: 300, margin: '10px auto', position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                <Slider {...sliderSettings}>
                  {post.media.map((media, i) => {
                    const isImage = media.type?.startsWith('image') || media.url?.match(/\.(jpg|jpeg|png|gif)$/i);
                    return (
                      <div key={i} style={{ width: '100%', height: 300, position: 'relative' }}>
                        {isImage ? (
                          <img
                            src={media.url}
                            alt={`Post media ${i + 1}`}
                            onClick={() => openImagePopup(media.url)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                          />
                        ) : (
                          <video controls src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                    );
                  })}
                </Slider>
              </div>
            )}

            {/* Image Modal */}
            {popupImage && (
              <Modal isOpen={!!popupImage} onRequestClose={closePopup} contentLabel="Image Preview"
                style={{
                  overlay: { backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 },
                  content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', background: 'none', border: 'none', padding: 0, maxWidth: '90vw', maxHeight: '90vh', overflow: 'hidden' }
                }}>
                <img src={popupImage} alt="Full View" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} onClick={closePopup} />
              </Modal>
            )}

            {/* Like Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 15 }}>
              <button style={{ background: 'transparent', color: '#374151', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                <UnLikeButtons /> {likes[`post_${post.id}`] || 0}
              </button>
            </div>

            {/* View/Hide Replies */}
            {post.replies && post.replies.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => toggleReplies(post.id)}
                  style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0, fontSize: 14 }}
                >
                  {showReplies[post.id] ? 'Hide Replies' : `View Replies (${post.replies.length})`}
                </button>
              </div>
            )}

            {/* Replies List */}
            {showReplies[post.id] &&
              post.replies.map((reply) => (
                <div key={reply.id} style={{ marginTop: 10, paddingLeft: 10, borderLeft: '3px solid #eee', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
                    <img src={reply.profile_picture || `${API_URL}/uploads/default-avatar.png`} alt="avatar"
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }} />
                    <strong>{reply.username}</strong>
                  </div>
                  <p style={{ marginTop: 5 }}>{reply.content}</p>

                  {/* Reply Media */}
                  {Array.isArray(reply.media) && reply.media.length > 0 && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 5 }}>
                      {reply.media.map((mediaItem, index) => {
                        const mediaUrl = mediaItem.url;
                        const isImage = mediaItem.type?.startsWith('image') || mediaUrl?.match(/\.(jpg|jpeg|png|gif)$/i);
                        return isImage ? (
                          <img key={index} src={mediaUrl} alt="reply media" style={{ width: 150, borderRadius: 8 }} />
                        ) : (
                          <video key={index} controls src={mediaUrl} style={{ width: 200, borderRadius: 8 }} />
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

          </div>
        ))
      )}
    </div>
  );
};

export default GroupPosts;
