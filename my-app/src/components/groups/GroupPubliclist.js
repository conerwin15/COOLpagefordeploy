import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../icon/loading";
import "./groupdesign/GroupListPublic.css";

const API_URL = process.env.REACT_APP_API_URL || "";

export default function GroupListPublic({ limit = null }) {
  const [publicGroups, setPublicGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/get_groups.php?where=public`);
      const data = await res.json();
      if (data.success) {
        setPublicGroups(data.public_groups || []);
      } else {
        console.error("Failed to fetch public groups:", data.message);
      }
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
    if (photo.startsWith("/")) return base ? `${base}${photo}` : photo;
    if (photo.includes("uploads/")) return base ? `${base}/${photo}` : photo;
    return base ? `${base}/uploads/groups/${photo}` : `/uploads/groups/${photo}`;
  };

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      await fetchPublicGroups();
      setLoading(false);
    };
    loadGroups();
  }, []);

  if (loading) {
    return (
      <div className="loading-wrapper">
        <Loading />
      </div>
    );
  }

  if (!publicGroups.length) {
    return <p className="empty-text">No public groups available.</p>;
  }

  const displayGroups = limit ? publicGroups.slice(0, limit) : publicGroups;

  return (
    <div className="group-wrapper">
      <div className="group-list">
        {displayGroups.map((g) => {
          const groupName = g.name || g.group_name || "Untitled Group";
          const groupDesc =
            g.description || g.group_description || "No description provided";
          const photoUrl = buildPhotoUrl(g.group_photos);

          return (
            <Link
              to={`/guest/group/public/${g.id}`}
              className="group-cardpublic-link"
              key={g.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className="group-cardpublic"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  height: "400px",
                  background: "#fff",
                  borderRadius: "10px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Image */}
                <div className="card-image">
                  <img
                    src={photoUrl}
                    alt={groupName}
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://fms.techtreeglobal.com/assets/uploads/1743233100_key.png")
                    }
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Content */}
                <div
                  className="card-content"
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "12px",
                    paddingBottom: "40px", // space for bottom button
                  }}
                >
                  <h3
                    style={{
                      textAlign: "center",
                      fontSize: "1rem",
                      margin: "8px 0",
                      color: "#222",
                    }}
                  >
                    {groupName}
                  </h3>
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "0.85rem",
                      color: "#555",
                      margin: "0",
                    }}
                  >
                    {groupDesc.length > 100
                      ? groupDesc.substring(0, 100) + "..."
                      : groupDesc}
                  </p>
                </div>

                {/* ✅ Fixed at bottom */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    textAlign: "center",
                   
                    padding: "10px 0",
                    fontSize: "0.7rem",
                    color: "#424de4ff",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  View Group
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
