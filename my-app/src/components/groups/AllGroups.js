import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./groupdesign/ListofGroup.css";
import DeleteButton from "../icon/deleteicon";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost/coolpage/my-app/backend";

export default function GetGroups({ isAdmin }) {
  const [allGroups, setAllGroups] = useState([]);

  // Fetch all groups (admin only)
  const fetchAllGroups = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`${API_URL}/get_all_groups.php`);
      const data = await res.json();
      if (data.success) setAllGroups(data.groups || []);
      else console.error("Failed to fetch all groups:", data.message);
    } catch (err) {
      console.error("Error fetching all groups:", err);
    }
  };

  useEffect(() => {
    fetchAllGroups();
  }, [isAdmin]);

  // Delete group
  const deleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      const res = await fetch(`${API_URL}/delete_group.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId }),
      });
      const data = await res.json();
      if (data.success) setAllGroups((prev) => prev.filter((g) => g.id !== groupId));
      else alert(data.message || "Failed to delete group.");
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  const buildPhotoUrl = (photo) => {
    const fallback = "https://fms.techtreeglobal.com/assets/uploads/1743233100_key.png";
    if (!photo) return fallback;
    if (/^https?:\/\//i.test(photo)) return photo;
    const base = API_URL.replace(/\/+$/, "");
    if (photo.startsWith("/")) return `${base}${photo}`;
    if (photo.includes("uploads/")) return `${base}/${photo}`;
    return `${base}/uploads/groups/${photo}`;
  };

  return (
    <div className="group-list2">
      {allGroups.length === 0 ? (
        <p>No groups found.</p>
      ) : (
        allGroups.map((g) => {
          const photoUrl = buildPhotoUrl(g.group_photos);
          const groupName = g.name || "Untitled Group";
          const groupDesc = g.description || "No description";

          return (
            <div
              key={g.id}
              className="group-cardlist2"
              style={{ position: "relative" }} // ✅ Needed for absolute button
            >
              {isAdmin && (
                <button
                  onClick={() => deleteGroup(g.id)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                 
                    zIndex: 2,
                  }}
                  title="Delete Group"
                >
                  <DeleteButton />
                </button>
              )}

              <Link
                to={`/group/${g.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
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
                  <h3 style={{ textAlign: "center", margin: "10px 0" }}>{groupName}</h3>
                  <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#555" }}>
                    
                    {groupDesc.length > 80 ? groupDesc.slice(0, 80) + "..." : groupDesc}
                  </p>
                   <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#0e1df0ff" }}>View Group</p>
                </div>
              </Link>
            </div>
          );
        })
      )}
    </div>
  );
}
