// src/groups/GroupInfo.js
import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

export default function GroupInfo({ groupId, members }) {
  const [groupInfo, setGroupInfo] = useState({
    name: "",
    description: "",
    photo: "",
    membersCount: 0,
    type: "",
  });

  const numericGroupId = Number(groupId);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      if (!groupId) return;

      try {
        const res = await fetch(`${API_URL}/get_group_info.php?group_id=${numericGroupId}`);
        const data = await res.json();
        if (data.success) {
          setGroupInfo({
            name: data.group.name || "",
            description: data.group.description || "",
            photo: data.group.photo ? `${API_URL}/${data.group.photo}` : "",
            membersCount: data.group.members_count || 0,
            type: data.group.visibility || "",
          });
        }
      } catch (err) {
        console.error("Error fetching group info:", err);
      }
    };

    fetchGroupInfo();
  }, [groupId]);

  useEffect(() => {
    if (Array.isArray(members)) {
      setGroupInfo((prev) => ({ ...prev, membersCount: members.length }));
    }
  }, [members]);

  // Check for mobile screen
  const isMobile = window.innerWidth <= 768;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "20px",
        border: "1px solid #ddd",
        borderRadius: isMobile ? "0" : "12px", // no border radius on mobile
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: isMobile ? "none" : "0 2px 8px rgba(0,0,0,0.1)",
        width: isMobile ? "100vw" : "auto", // full width for mobile
        marginLeft: isMobile ? "-10px" : "0", // removes container padding effect
        marginRight: isMobile ? "-10px" : "0",
      }}
    >
      {/* Cover Photo */}
      {groupInfo.photo && (
        <div style={{ position: "relative", width: "100%", height: "180px" }}>
          <img
            src={groupInfo.photo}
            alt="Group Cover"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "20px",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid white",
              backgroundColor: "#f0f0f0",
            }}
          >
            <img
              src={groupInfo.photo}
              alt="Group Icon"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      )}

      {/* Group Details */}
      <div
        style={{
          padding: "16px",
          paddingTop: groupInfo.photo ? "46px" : "16px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "600", color: "#222" }}>
          {groupInfo.name}
        </h2>
        <p style={{ margin: "8px 0", fontSize: "14px", color: "#555" }}>
          {groupInfo.description}
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "13px",
            color: "#888",
            marginTop: "8px",
          }}
        >
          <span>Type: {groupInfo.type || "Public"}</span>
          <span>Members: {groupInfo.membersCount}</span>
        </div>
      </div>
    </div>
  );
}
