import React, { useEffect, useState } from "react";
import Delete from "../icon/deleteicon"
const API_URL = process.env.REACT_APP_API_URL;

export default function BannerCarousel({ user }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true); // For fade effect

  // ✅ Fetch banners from backend
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

  // ✅ Auto-rotate banners
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

  // ✅ Delete banner (for admin)
  const handleDelete = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      const res = await fetch(`${API_URL}/delete_banner.php`, {
        method: "POST", // ✅ your backend expects POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bannerId }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed to delete banner");

      // ✅ Update state locally
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      setCurrentIndex((prev) =>
        prev >= banners.length - 1 ? 0 : prev
      );

      alert("Banner deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting banner.");
    }
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
        opacity: 1,
        transform: "translateY(0)",
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
    >
      {/* ✅ Banner Image with fade effect */}
      {banners[currentIndex] && (
        <div
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "auto",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.9)",
            transition:
              "transform 0.5s ease, opacity 0.5s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 10px 25px rgba(0, 0, 0, 0.4)";
            e.currentTarget.style.transform = "translateY(-5px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(0, 0, 0, 0.25)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <img
            src={`${API_URL}/uploads/banners/${banners[currentIndex].image}`}
            alt={`Banner ${banners[currentIndex].id}`}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "auto",
           
              transition:
                "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
              opacity: fade ? 1 : 0,
              display: "block",
            }}
          />
        </div>
      )}

      {/* Delete button visible only for admin */}
      {user?.role === "admin" && banners[currentIndex] && (
        <button
          onClick={() => handleDelete(banners[currentIndex].id)}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(255,255,255,0.95)",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            fontSize: "18px",
            cursor: "pointer",
            color: "#f44336",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            transition: "transform 0.3s ease, background 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.background = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "rgba(255,255,255,0.95)";
          }}
          title="Delete Banner"
        >
         <Delete />
        </button>
      )}

      {/* ✅ Pagination dots */}
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
              backgroundColor:
                currentIndex === idx ? "#007bff" : "#ccc",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}
