import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true); // For fade effect

  // Fetch banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/get_banners.php`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setBanners(data.banners || []);
      } catch (err) {
        console.error("Failed to fetch banners:", err);
        setError("Failed to load banners");
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
        setFade(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const prevBanner = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
      setFade(true);
    }, 500);
  };

  const nextBanner = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      setFade(true);
    }, 500);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading banners...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (banners.length === 0) return <p style={{ textAlign: "center" }}>No banners available</p>;

  return (
    <div
      style={{
        position: "relative",
        maxWidth: "100%",

  
        overflow: "hidden",
        opacity: 1, // Always visible
        transform: "translateY(0)",
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
    >
      {/* Banner Image with fade effect */}
      {banners[currentIndex] && (
        <div
  style={{
    width: "100%",
    height: "auto",
    maxHeight: "500px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.9)", // ✅ softer, more natural shadow
 
    transition: "transform 0.5s ease, opacity 0.5s ease, box-shadow 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.4)";
    e.currentTarget.style.transform = "translateY(-5px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.25)";
    e.currentTarget.style.transform = "translateY(0)";
  }}
>

          <img
            src={`${API_URL}/uploads/banners/${banners[currentIndex].image}`}
            alt={`Banner ${banners[currentIndex].id}`}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "400px",
              objectFit: "cover",
              transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
              opacity: fade ? 1 : 0,
              display: "block",
            }}
          />
        </div>
      )}

      {/* Welcome Overlay 
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#fff",
          textAlign: "center",
          padding: "clamp(5px, 2vw, 15px)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderRadius: "12px",
          width: "clamp(150px, 70%, 100%)",
          boxShadow: "0 4px 20px rgba(9, 11, 14, 0.5)",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1rem, 4vw, 2rem)",
            margin: "0 0 8px",
            fontWeight: "700",
            lineHeight: "1.2",
            textShadow: "2px 2px 6px rgba(0,0,0,0.4)",
          }}
        >
          Welcome to the COOL COMMUNITY
        </h1>
        <p
          style={{
            fontSize: "clamp(0.8rem, 2.5vw, 1.1rem)",
            margin: 0,
            fontWeight: "500",
            textShadow: "1px 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          Join with our learners and discussions
        </p>
      </div>

      {/* Dot Indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "5px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        {banners.map((_, idx) => (
          <span
            key={idx}
            onClick={() => {
              setFade(false);
              setTimeout(() => {
                setCurrentIndex(idx);
                setFade(true);
              }, 500);
            }}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: currentIndex === idx ? "#007bff" : "#ccc",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}
