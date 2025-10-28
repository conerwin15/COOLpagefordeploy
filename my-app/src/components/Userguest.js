import React, { useState, useEffect } from "react";
import PostListGuest from "../components/PostlistGuest";
import GroupListPublic from "../components/groups/GroupListPublic";
import Loading from "../components/icon/loading";
import NewsCarousel from "../components/whatisnew/NewsCarousel";
import Guestheader from "./headers/guestheader";
import Bannerdisplay from "./banners/BannerDisplay"
import MessagefromCOE from "./banners/MessageCEO"
import Aboutus from "./banners/Aboutus"
import TestimonialCarousel from "./banners/Testimonial";
import Coolevents from './addCoolactivities/EventList'
import eventlist from './addCoolactivities/Evenlistverticalview'

const UserGuest = ({ onLike, likes, userLiked }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [banners, setBanners] = useState([]);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true); // For fade effect
  

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/get_posts.php`);
        const data = await res.json();
        if (data.success && Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          setPosts([]);
          console.error("Unexpected response format", data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [API_URL]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setShowSidebar(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* ✅ Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#fff",
          boxShadow: "0 2px 8px rgba(2, 0, 0, 0.1)",
        }}
      >
        <Guestheader />
      </div>

      <div style={styles.container}>
        {/* Sidebar */}
        {showSidebar && (
        <aside
  className="public-groups-sidebar"
  style={{
    ...styles.sidebar,
    width: isMobile ? "80%" : "250px",
    background: "#fff",
    borderRight: "1px solid #ddd",
    overflowY: "auto",
    borderRadius: "1px",
    padding: "15px",
    transition: "all 0.3s ease",
    ...(isMobile
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 999,
          boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
        }
      : {
          position: "sticky",
          top: "20px",
          height: "calc(100vh - 40px)",
          alignSelf: "flex-start",
          zIndex: 10,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }),
  }}
>
  {/* Sidebar Title */}
 <h5
  className="group-label"
  style={{
    fontSize: "16px",
    fontWeight: "bold",
    color: "#161718ff",
    textAlign: "center",       // ✅ centers the text
    margin: "0 auto 12px",     // ✅ centers block and adds bottom space
    paddingBottom: "6px",
    borderBottom: "2px solid #ebedefff", // ✅ optional underline accent
    width: "fit-content",      // ✅ keeps underline tight to text
  }}
>
  Public Groups
</h5>

  {/* Sidebar Content */}
  <GroupListPublic />

  {/* Scrollbar Styling (embedded in component) */}
  <style>{`
    .public-groups-sidebar {
      scrollbar-width: thin; /* Firefox */
      scrollbar-color: #d8ebffff #f1f1f1;
    }

    .public-groups-sidebar::-webkit-scrollbar {
      width: 8px;
    }

    .public-groups-sidebar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .public-groups-sidebar::-webkit-scrollbar-thumb {
      background-color: #ebf2f9ff;
      border-radius: 10px;
      border: 2px solid #f1f1f1;
    }

    .public-groups-sidebar::-webkit-scrollbar-thumb:hover {
      background-color: #d4e1eeff;
    }
  `}</style>
</aside>
        )}

        {/* Posts Section */}
        <main style={styles.posts}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "1px" }}>
              <Loading />
            </div>
          ) : posts.length > 0 ? (
            <>
            <div><Bannerdisplay /></div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "20px",
                  width: "100%",
                  maxWidth: "100%",
                  marginInline: "auto",
                  flexWrap: "wrap",
                  padding: "0 10px",
                  boxSizing: "border-box",
                }}
              >        
   <div
   
   
   style={{
  
            margin: "10px",
         
          }}
   
   
   >
    <Aboutus/>
    
    <MessagefromCOE />
</div>
                <NewsCarousel />
             <Coolevents />
              </div>
              <PostListGuest
                posts={posts}
                user={null}
                onReply={() => {}}
                onRefresh={() => {}}
                onLike={onLike}
                likes={likes}
                userLiked={userLiked}
              />

              <TestimonialCarousel />
            </>
          ) : (
            <div style={{ padding: "1px", textAlign: "center", color: "#555" }}>
              No public posts available
            </div>
          )}
        </main>

        {/* Mobile floating button */}
        {isMobile && (
          <button
            style={styles.floatingButton}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? "✖ Close Groups" : "Show Groups"}
          </button>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    background: "#f9f9f9",
    minHeight: "100vh",
    position: "relative",
  },
  sidebar: {
    padding: "15px",
    borderRight: "1px solid #ddd",
    background: "#fff",
    overflowY: "auto",
    transition: "all 0.3s ease",
  },
  posts: {
    flex: 1,
    padding: "20px",
    minWidth: 0,
    overflowY: "auto",
  },
  floatingButton: {
  position: "fixed",
bottom: "20px",
right: "20px",
backgroundColor: "#007bff",
color: "#fff",
border: "none",
borderRadius: "25px",
padding: "10px 15px",
fontSize: "14px",
cursor: "pointer",
boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
zIndex: 9999,
}
};

export default UserGuest;
