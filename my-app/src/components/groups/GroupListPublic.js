import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import Loading from "../icon/loading";
import "./groupdesign/GroupListPublic.css";

const API_URL = process.env.REACT_APP_API_URL || "";

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

export default function GroupListPublic({ limit = 10 }) {
  const [publicGroups, setPublicGroups] = useState([]);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const fetchPublicGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/get_groups.php?where=public`);
      const data = await res.json();
      if (data.success) setPublicGroups(data.public_groups || []);
    } catch (err) {
      console.error("Error fetching public groups:", err);
    }
  };

  const buildPhotoUrl = (photo) => {
    const fallback =
      "https://fms.techtreeglobal.com/assets/uploads/1743233100_key.png";
    if (!photo) return fallback;
    if (/^https?:\/\//i.test(photo)) return photo;
    const base = API_URL.replace(/\/+$/, "");
    if (photo.startsWith("/")) return `${base}${photo}`;
    if (photo.includes("uploads/")) return `${base}/${photo}`;
    return `${base}/uploads/groups/${photo}`;
  };

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      await fetchPublicGroups();
      setLoading(false);
      setVisible(true); // ✅ fade-in after data loads
    };
    loadGroups();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const slides =
        width < 500 ? 1 : width < 900 ? 2 : Math.max(3, Math.floor(width / 400));
      setSlidesToShow(slides);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 600,
    slidesToShow,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    adaptiveHeight: true,
  };

  if (loading)
    return (
      <div className="loading-wrapper">
        <Loading />
      </div>
    );

  if (!publicGroups.length)
    return <p className="empty-text">No public groups available.</p>;

  const displayGroups = publicGroups.slice(0, limit);

  return (
    <div
      className={`group-carousel-wrapper ${visible ? "fade-in" : "fade-out"}`}
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
   COOL
  <span
    style={{
      background: "linear-gradient(90deg, #007bff, #00c6ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    {" "}Groups
  </span>
</h2>


      <Slider {...settings} className="group-carousel">
        {displayGroups.map((g) => {
          const groupName = g.name || g.group_name || "Untitled Group";
          const groupDesc =
            g.description || g.group_description || "No description provided";
          const photoUrl = buildPhotoUrl(g.group_photos);

          return (
            <div key={g.id} className="group-card-slide">
              <Link
                to={`/guest/group/public/${g.id}`}
                className="group-card-link"
              >
                <div className="group-cardpublic2">
                  <div className="card-image">
                    <img
                      src={photoUrl}
                      alt={groupName}
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://fms.techtreeglobal.com/assets/uploads/1743233100_key.png")
                      }
                    />
                  </div>
                  <div className="card-content">
                    <h3>{groupName}</h3>
                    <p>
                      {groupDesc.length > 120
                        ? groupDesc.substring(0, 120) + "..."
                        : groupDesc}
                    </p>
                    <p className="view-group-text">View Group</p>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </Slider>

      {publicGroups.length > limit && (
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <Link to="/groups/all-public" className="see-all-link">
            Click to see all public groups
          </Link>
        </div>
      )}
    </div>
  );
}
