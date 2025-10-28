import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import "./NewsCarousel.css";
import { useNavigate } from "react-router-dom";
import DeleteButtons from "../icon/deleteicon";

const API_URL = process.env.REACT_APP_API_URL;

// Custom Arrows
const NextArrow = ({ onClick }) => (
  <div className="arrow next" onClick={onClick}>
    &#10095;
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div className="arrow prev" onClick={onClick}>
    &#10094;
  </div>
);

const NewsCarousel = (user) => {
  const [news, setNews] = useState([]);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Fade + Zoom on Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch news
  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_URL}/get_newslist.php`);
      const data = await res.json();
      if (data.success) setNews(data.news);
    } catch (err) {
      console.error("Error fetching news:", err);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Delete news post
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`${API_URL}/delete_newspost.php?id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Post deleted successfully!");
        fetchNews();
      } else {
        alert(data.message || "Failed to delete post");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("An error occurred while deleting post.");
    }
  };

  // Responsive slides
  useEffect(() => {
    const updateSlides = () => {
      const width = window.innerWidth;
      let slides = width < 768 ? 1 : width < 1024 ? 2 : Math.max(2, Math.floor(width / 400));
      setSlidesToShow(slides);
    };

    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div
      ref={sectionRef}
      className="news-wrapper"
      style={{
        transform: visible ? "scale(1)" : "scale(0.95)",
        opacity: visible ? 1 : 0,
        transition: "transform 1s ease, opacity 1s ease",
      }}
    >
    <h2
  style={{
    width: "100%",
    display: "block",
    textAlign: "center",
    margin: "20px auto",
        fontSize: "1.5rem",
    fontWeight: "800",
  }}
>
  News and
  <span
    style={{
      background: "linear-gradient(90deg, #007bff, #00c6ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    {" "}Highlights
  </span>
</h2>

      <div className="news-carousel">
        <Slider {...settings}>
          {news.map((item) => {
            const firstMedia =
              item.media && item.media.length > 0 ? item.media[0].url : null;

            return (
              <div key={item.id} className="news-card">
                {firstMedia ? (
                  firstMedia.endsWith(".mp4") || firstMedia.endsWith(".webm") ? (
                    <video
                      className="news-media"
                      src={firstMedia}
                      controls
                      poster="https://fms.techtreeglobal.com/assets/uploads/1758604320_logo.jpg"
                    />
                  ) : (
                    <img src={firstMedia} alt="news" className="news-media" />
                  )
                ) : (
                  <img
                    src="https://fms.techtreeglobal.com/assets/uploads/1758604320_logo.jpg"
                    alt="news"
                    className="news-media"
                  />
                )}

                <p
                  style={{
                    margin: "10px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#333",
                    lineHeight: "1.4",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.title}
                </p>

                <div className="news-content">
                  <p className="news-text">
                    {item.content.length > 120
                      ? item.content.substring(0, 120) + "..."
                      : item.content}
                  </p>

                  <button
                    className="details-btnCarousel"
                    onClick={() => navigate(`/news/${item.id}`)}
                  >
                    Click for more details
                  </button>

                  {user?.role === "admin" && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item.id)}
                    >
                      <DeleteButtons />
                    </button>
                  )}

                  <p className="news-author">
                    Posted last:{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

export default NewsCarousel;
