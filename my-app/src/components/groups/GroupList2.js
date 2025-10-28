import React from "react";
import { Link } from "react-router-dom";
import "./groupdesign/ListofGroup.css";
import DeleteButton  from "../icon/deleteicon";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost/coolpage/my-app/backend";

export default function ListofGroup({
  myGroups = [],
  publicGroups = [],
  selectedTab,
  isAdmin = false,
  deleteGroup, // ✅ added delete function
}) {
  const buildPhotoUrl = (photo) => {
    const fallback = "https://fms.techtreeglobal.com/assets/uploads/1743233100_key.png";
    if (!photo) return fallback;

    if (/^https?:\/\//i.test(photo)) return photo;

    const base = API_URL.replace(/\/+$/, "");
    if (photo.startsWith("/")) return `${base}${photo}`;
    if (photo.includes("uploads/")) return `${base}/${photo}`;
    return `${base}/uploads/groups/${photo}`;
  };

  const renderGroupCard = (g, isPublic = false) => {
    const groupName = g.name || g.group_name || "Untitled Group";
    const groupDesc = g.description || g.group_description || "No description provided";
    const photoUrl = buildPhotoUrl(g.group_photos);

  return (
      <div key={g.id} className="group-cardlist2-wrapper">
        {/* ✅ Admin delete button (top-right) */}
        {isAdmin && (
          <button
            className="group-delete-btn"
            title="Delete this group"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm(`Delete group "${groupName}"?`)) {
                deleteGroup && deleteGroup(g.id);
              }
            }}
          >
            <DeleteButton />
          </button>
        )}

        {/* ✅ Card link */}
        <Link
          to={isPublic ? `/group/public/${g.id}` : `/group/${g.id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "block",
            width: "100%",
          }}
        >
          <div
            className="group-cardlist2"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              borderRadius: "8px",
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            {/* Image */}
            <div className="card-image">
              <img
                src={photoUrl}
                alt={groupName}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://fms.techtreeglobal.com/assets/uploads/1743233100_key.png";
                }}
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
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flexGrow: 1,
                padding: "10px",
              }}
            >
              <div>
                <h3
                  style={{
                    textAlign: "center",
                    margin: "10px 0",
                    fontSize: "1rem",
                    color: "#222",
                  }}
                >
                  {groupName}
                </h3>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "0.9rem",
                    color: "#555",
                    marginBottom: "12px",
                  }}
                >
                  {groupDesc.length > 80
                    ? groupDesc.slice(0, 80) + "..."
                    : groupDesc}
                </p>
              </div>

              {/* ✅ “View Group” at the bottom */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.7rem",
                  color: " #0083f6ff",
                  marginTop: "auto",
                  padding: "10px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                View Group
              </p>
            </div>
          </div>
        </Link>
      </div>
    );
  };
  if (selectedTab === "my") {
    return myGroups.length === 0 ? (
      <p>No groups created.</p>
    ) : (
      <div className="group-list2">{myGroups.map((g) => renderGroupCard(g))}</div>
    );
  }

  if (selectedTab === "public") {
    return publicGroups.length === 0 ? (
      <p>No public groups available.</p>
    ) : (
      <div className="group-list2">{publicGroups.map((g) => renderGroupCard(g, true))}</div>
    );
  }

  return null;
}
