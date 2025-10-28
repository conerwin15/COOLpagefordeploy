import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LikeButtons from './icon/LikeButton';
import ReplyButton from './icon/replybutton';
import UnLikeButtons from './icon/unlikebutton';
import DeleteButtons from './icon/deleteicon';
import ShareButton from './icon/shareicome';
import NestedReplies from './nestedreply';


const PostListGuest = ({ posts, onReply, user, onRefresh }) => {
 const [replyContents, setReplyContents] = useState({});
  const [mediaFiles, setMediaFiles] = useState({});
  const [showReplyBox, setShowReplyBox] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [likes, setLikes] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const scrollRef = useRef(null);
  const postsPerPage = 5;
    const [likedPosts, setLikedPosts] = useState([]); // ✅ Declare here
  const [expandedContent, setExpandedContent] = useState({});
const [showDropdown, setShowDropdown] = useState({});
const [showAllImages, setShowAllImages] = useState({}); // key by reply.id
  const [popupPhoto, setPopupPhoto] = useState(null);
  const closePopup = () => setPopupPhoto(null);

const [replies, setReplies] = useState({});
const [searchTerm, setSearchTerm] = useState('ALL');




  const [editPost, setEditPost] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
  const [visibleReplies, setVisibleReplies] = useState({});


  const [isDragging, setIsDragging] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
const [sortType, setSortType] = useState('latest'); // NEW
  const API_URL= process.env.REACT_APP_API_URL;
const [nestedReplyMedia, setNestedReplyMedia] = useState({});
const [showNestedReplies, setShowNestedReplies, nestedReplies] = useState({});

useEffect(() => {
  const fetchLikes = async () => {
    try {
      const res = await fetch(`${API_URL}/get_likes.php`);
      const data = await res.json();
      if (data.success) {
        setLikes(data.total_likes || {});
        setUserLiked(data.user_liked || {});
      }
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  };
  fetchLikes();
}, []);

 useEffect(() => {
  const fetchLikes = async () => {
    if (!user?.id) return; // Skip if user is not loaded yet

    try {
      const res = await fetch(`${API_URL}/get_likes.php?user_id=${user.id}`);
      const data = await res.json();

      if (data.success) {
        // ✅ Set total like counts for posts, replies, and child replies
        setLikes({
          posts: data.total_likes?.posts || {},
          replies: data.total_likes?.replies || {},
        });

        // ✅ Store what the current user has liked (post, reply, or nested reply)
        setUserLiked(data.user_liked || {});
      } else {
        console.warn("Failed to load like data:", data.message);
      }
    } catch (err) {
      console.error("Error fetching likes:", err.message);
    }
  };

  fetchLikes();
}, [API_URL, user?.id, posts]);

  // Toggle like/unlike
  const handleLikeToggle = async (postId) => {
    const isLiked = likedPosts.includes(postId);

    // Optimistic UI update
    setLikes((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + (isLiked ? -1 : 1),
    }));

    const updatedLikedPosts = isLiked
      ? likedPosts.filter((id) => id !== postId)
      : [...likedPosts, postId];

    setLikedPosts(updatedLikedPosts);
    localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));

    try {
      await fetch(`${API_URL}/likeguest.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, action: isLiked ? 'unlike' : 'like' }),
      });
    } catch (err) {
      console.error('Error toggling like:', err.message);
    }
  };
const handleShare = (id) => {
  const shareUrl = `${window.location.origin}/home/public/${id}`;

  if (navigator.share) {
    navigator
      .share({
        title: 'Check out this post!',
        url: shareUrl,
      })
      .then(() => console.log('Post shared successfully'))
      .catch((err) => console.error('Error sharing', err));
  } else {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  }
};


  const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const currentPosts = sortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

const formatDate = (timestamp, fixedTimeZone = null) => {
  // Decide which timezone to use: user’s local or fixed
  const timeZone = fixedTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Convert timestamp from UTC to chosen time zone
  const localDate = new Date(
    new Date(timestamp).toLocaleString("en-US", { timeZone })
  );

  const localNow = new Date(
    new Date().toLocaleString("en-US", { timeZone })
  );

  const diff = (localNow.getTime() - localDate.getTime()) / 1000;

  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  // Format date in chosen time zone
  return new Intl.DateTimeFormat("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone
  }).format(localDate);
};

// Example usage:
// Auto-adjust to user’s local time
console.log(formatDate("2025-08-13T06:30:00Z"));

// Force Singapore time
console.log(formatDate("2025-08-13T06:30:00Z", "Asia/Singapore"));


  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-trigger')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


const handleLike = async (targetId, type) => {
  const key = type === 'post' ? `post_${targetId}` :
              type === 'reply' ? `reply_${targetId}` :
              `child_reply_${targetId}`;

  const liked = !!userLiked[key];

  // Optimistic update
  setLikes(prev => ({
    ...prev,
    [key]: liked ? Math.max(0, (prev[key] || 1) - 1) : (prev[key] || 0) + 1
  }));

  setUserLiked(prev => ({
    ...prev,
    [key]: !liked
  }));

  try {
    await fetch(`${API_URL}/likeguest.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_id: targetId,
        target_type: type,
        action: liked ? 'unlike' : 'like',
        ...(user?.id ? { user_id: user.id } : {})
      })
    });
  } catch (err) {
    console.error('Like/unlike failed:', err);
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
};

  const createLinkifiedText = (text) => {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb">$1</a>'
  );
};
  return (
<div
  className="post-list"
  style={{
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    padding: window.innerWidth <= 768 ? '10px 5px 80px 5px' : '20px 10px 100px 5px',
     flexDirection: window.innerWidth <= 768 ? "column" : "row",

    boxSizing: 'border-box'
  }}
>

  
<div
  style={{
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: '#fff', // ensure visibility
    padding: '10px 0',
    display: 'flex',
    flexWrap: 'wrap',
 
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee', // optional subtle divider
  }}
>
  {/* Left side: title */}
           <h2
  style={{
  
  
        fontSize: "1.5rem",
    fontWeight: "800",
  }}
>
   Latest
  <span
    style={{
      background: "linear-gradient(90deg, #007bff, #00c6ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    {" "}Discussion
  </span>
</h2>

  {/* Right side: search + dropdown */}
  <div
    style={{
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
    }}
  >
    <input
      type="text"
      placeholder="Search discussion..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        fontSize: '10px',
        width: window.innerWidth <= 768 ? '50%' : '300px',
        height: '35px',
        boxSizing: 'border-box',
      }}
    />

    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      style={{
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        fontSize: '10px',
        width: window.innerWidth <= 768 ? '50%' : '150px',
        height: '35px',
        boxSizing: 'border-box',
      }}
    >
      <option value="">All Categories</option>
      {[...new Set(posts.map((p) => p.category))].map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>
</div>



 
      {/* Filtered and Sorted Posts */}
      {currentPosts
        .filter((post) => {
          const matchesSearch =
            searchQuery.trim() === '' ||
            post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.username?.toLowerCase().includes(searchQuery.toLowerCase());
  
          const matchesCategory =
            selectedCategory === '' ||
            post.category?.toLowerCase() === selectedCategory.toLowerCase();
  
          return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
          if (sortType === 'latest') {
            return new Date(b.created_at) - new Date(a.created_at);
          } else if (sortType === 'top') {
            return (b.likes_count || 0) - (a.likes_count || 0);
          }
          return 0;
        })
  
   
  
    .map((post) => (

      
      <div key={post.id} className="post-card" style={{ 

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
     flexDirection: window.innerWidth <= 768 ? "column" : "row",

 }}>



        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <img src={post.profile_picture || 'Logo/default-avatar.png'} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginRight: '12px' }} />
          <div>

            <div style={{ fontWeight: 600 }}>{post.first_name} {post.last_name}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(post.created_at)} · {post.category} · {post.country}</div>
          </div>
        </div>

                          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#102a43', marginBottom: '16px' }}>{post.title}</h2>

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
             backgroundColor: 'rgba(244, 234, 234, 0.8)',
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
                   <video-
                     controls
                     style={{
                       width: '100%',
                       height: '100%',
                       objectFit: 'cover',
                     }}
                   >
      <source src={file.url} type={getMimeType(file.url)} />
                     
                   </video->
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
                 inset: 0,
                 background: 'rgba(0,0,0,0.8)',
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center',
                 zIndex: 1000,
                 cursor: 'pointer',
               }}
             >
               <div
                 onClick={(e) => e.stopPropagation()}
                 style={{ position: 'relative' }}
               >
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
                   onClick={(e) => {
                     e.stopPropagation();
                     setPopupPhoto(null);
                   }}
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
    

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
 <button onClick={() => handleLike(post.id, 'post')}

  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent', // no background
    border: 'none',            // no border
    borderRadius: '20px',
    padding: '6px 14px',
    color: '#2563eb',
    fontWeight: 500,
    cursor: 'pointer'
  }}
>
 {userLiked[`post_${post.id}`] ? <LikeButtons /> : <UnLikeButtons />}
  <span>{likes[`post_${post.id}`] ?? 0}</span>
</button>

  <button
    onClick={() => handleShare(post.id)}
    style={{
      fontSize: '14px',
      color: '#28a745',
      fontWeight: 'bold',
      background: 'transparent',
      border: 'none',
      padding: '4px 10px',
      borderRadius: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
 
    }}
  >
    <ShareButton />

  </button>

          {post.replies && post.replies.length > 0 && (
           <button
             onClick={() =>
               setShowReplies((prev) => ({
                 ...prev,
                 [post.id]: !prev[post.id],
               }))
             }
             style={{
               background: 'transparent',
               border: 'none',
               borderRadius: '20px',
               color: '#1d4ed8',
               fontWeight: '500',
               cursor: 'pointer',
               fontSize: window.innerWidth <= 768 ? '8px' : '15px',
             }}
           >
             {(() => {
               // ✅ Filter replies to only include main (top-level) replies
               const mainReplies = post.replies.filter(
                 (reply) => !reply.parent_reply_id || reply.parent_reply_id === 0
               );
         
               const count = mainReplies.length;
         
               return showReplies[post.id]
                 ? 'Hide replies'
                 : `View ${count} repl${count === 1 ? 'y' : 'ies'}`;
             })()}
           </button>
         )}
         </div>

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
   <button onClick={() => handleLike(reply.id, 'reply')}
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
    gap: '4px',
  }}
>
 {userLiked[`reply_${reply.id}`] ? <LikeButtons /> : <UnLikeButtons />}
  <span>{likes[`reply_${reply.id}`] ?? 0}</span>
</button>

                  {/* Delete button */}
                  

                  {/* ✅ Reply button */}
              
                </div>

                {/* ✅ Reply box (for replying to this reply) */}


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
             margin: "5px 0",
            width:"300px",

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
           margin: "5px 0",
            width:"300px",

            borderRadius: "4px",
            objectFit: "contain",
          }}
        >
          <source src={item.url} type={getMimeType(item.url)} />
        </video>
      ) : null;
    })}

  {/* te buttons */}
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
      <span style={{ color: "#666" }}>{likes[`reply_${child?.id}`] || 0}</span>
    </button>

  
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
    ))}

       {totalPages > 1 && (
     <div
       style={{
         display: 'flex',
         justifyContent: 'center',
         marginTop: '20px',
         gap: '10px',
         flexWrap: 'wrap'
       }}
     >
       <button
         disabled={currentPage === 1}
         onClick={() => handlePageChange(currentPage - 1)}
         style={{
           background: 'transparent',
           border: '2px solid #4a90e2',
           color: '#4a90e2',
           padding: '8px 16px',
           borderRadius: '6px',
           fontSize: '14px',
           cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
           opacity: currentPage === 1 ? 0.5 : 1,
           transition: 'all 0.3s ease'
         }}
         onMouseEnter={(e) => {
           if (currentPage !== 1) {
             e.target.style.background = '#4a90e2';
             e.target.style.color = '#fff';
           }
         }}
         onMouseLeave={(e) => {
           if (currentPage !== 1) {
             e.target.style.background = 'transparent';
             e.target.style.color = '#4a90e2';
           }
         }}
       >
         &laquo; Prev
       </button>
   
       <span style={{ alignSelf: 'center', fontSize: '14px', color: '#555' }}>
         Page {currentPage} of {totalPages}
       </span>
   
       <button
         disabled={currentPage === totalPages}
         onClick={() => handlePageChange(currentPage + 1)}
         style={{
           background: 'transparent',
           border: '2px solid #4a90e2',
           color: '#4a90e2',
           padding: '8px 16px',
           borderRadius: '6px',
           fontSize: '14px',
           cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
           opacity: currentPage === totalPages ? 0.5 : 1,
           transition: 'all 0.3s ease'
         }}
         onMouseEnter={(e) => {
           if (currentPage !== totalPages) {
             e.target.style.background = '#4a90e2';
             e.target.style.color = '#fff';
           }
         }}
         onMouseLeave={(e) => {
           if (currentPage !== totalPages) {
             e.target.style.background = 'transparent';
             e.target.style.color = '#4a90e2';
           }
         }}
       >
         Next &raquo;
       </button>
     </div>
   )}
  </div>
);
}
export default PostListGuest;
