import React, { useState, useEffect } from "react";
import PostListGuest from "../components/PostlistGuest";
import Loading from "../components/icon/loading";
import NewsCarousel from "../components/whatisnew/NewsCarousel";
import Guestheader from "./headers/guestheader";
import Bannerdisplay from "./banners/BannerDisplay";
import MessagefromCOE from "./banners/MessageCEO";
import Aboutus from "./banners/Aboutus";
import Joinus from "./banners/JoinUsFrames";
import TestimonialCarousel from "./banners/Testimonial";
import Coolevents from "./addCoolactivities/Evenlistverticalview";
import GroupListPublic from "../components/groups/GroupListPublic"; // still used inside main content

const UserGuest = ({ onLike, likes, userLiked }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  // ✅ Fetch Posts
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

  return (
    <>
      {/* ✅ Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Guestheader />
      </div>

      <div style={styles.container}>
        {/* ✅ Main Content */}
        <main style={styles.posts}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Loading />
            </div>
          ) : posts.length > 0 ? (
            <>
              <Bannerdisplay />

              {/* ✅ News + Events Section */}
              <div style={styles.sectionWrapper}>
                <MessagefromCOE />    </div>
                
                <Coolevents />
          

              {/* ✅ Public Groups Section (kept inline, not sidebar) */}
              <div style={{ margin: "20px" }}>
                <GroupListPublic />
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
<NewsCarousel />
              <Aboutus />
              <TestimonialCarousel />
              <Joinus />
            </>
          ) : (
            <div style={{ padding: "1px", textAlign: "center", color: "#555" }}>
              No public posts available
            </div>
          )}
        </main>
      </div>
    </>
  );
};

const styles = {
container: {
  display: "flex",
  flexDirection: "column",
  background: "#f9f9f9",
  minHeight: "100vh",
  overflowY: "hidden", // ✅ fixed typo
    overflowX: "hidden", // ✅ prevents horizontal scroll too
},
  posts: {
    flex: 1,
    padding: "1px",
    overflowX: "hidden",
    width: "100%",
    boxSizing: "border-box",
    overflowY: "hidden", // ✅ fixed typo
  },
  sectionWrapper: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "20px",
    width: "100%",
  },
};

export default UserGuest;
