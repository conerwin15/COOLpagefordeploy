// GroupPostsPublicView.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GroupPostForm from './GroupPostForm';
import GroupPostCard from './GroupPostcard';
import LikeButtons from '../icon/LikeButton';
import UnLikeButtons from '../icon/unlikebutton';
import Slider from 'react-slick';
import { AnimatePresence, color, motion } from 'framer-motion';


import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Modal from 'react-modal';

const GroupPosts = ({ user }) => {
  const { groupId } = useParams();
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const [repliesByPostId, setRepliesByPostId] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [expandedContent, setExpandedContent, setActiveReplyBox] = useState({});
  const [setExpandedPostId, setPopupImage, setShowDropdown, showDropdown] = useState(null);
  const [showAllImages,expandedPostId, setShowAllImages,toggleReplyForm] = useState({}); // key by reply.id
 
  const API_URL = process.env.REACT_APP_API_URL;

  const openImagePopup = (url) => setPopupImage(url);
  const closePopup = () => setPopupImage(null);

  const toggleReplies = (postId) => {
    setShowReplies((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };
  const [popupPhoto, setPopupPhoto] = useState(null); // ✅ add this state

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
               wordBreak: "break-word",
    overflowWrap: "anywhere",
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
      const isImg = isImage(mediaItem.url);
      const isVid = isVideo(mediaItem.url);

      return (
        <div
          key={`${post.id}-${idx}`}
          style={{
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            aspectRatio: '1 / 1',
            backgroundColor: '#f9f9f9',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: isImg ? 'pointer' : 'default',
          }}
          onClick={() => isImg && setPopupPhoto(mediaItem.url)}
        >
          {isImg ? (
            <>
              <img
                src={mediaItem.url}
                alt="media"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
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
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  pointerEvents: 'none',
                }}
              >
                View Photo
              </div>
            </>
          ) : isVid ? (
            <video
              controls
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
            div:hover img {
              transform: scale(1.05);
            }
          `}</style>
        </div>
      );
    })}
  </div>
)}

{/* Image popup modal */}
{popupPhoto && (
  <div
    onClick={() => setPopupPhoto(null)}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      cursor: 'zoom-out',
    }}
  >
    <img
      src={popupPhoto}
      alt="popup"
      style={{
        maxWidth: '90%',
        maxHeight: '85%',
        borderRadius: '12px',
        boxShadow: '0 4px 25px rgba(0,0,0,0.4)',
      }}
    />
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
  
  <div style={{ fontSize: "0.7em", color: "#888", marginTop: "2px" }}>
    {formatDate(reply.created_at)}
  </div>
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
 
  }

           

  
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
