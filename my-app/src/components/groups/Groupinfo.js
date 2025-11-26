import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

export default function GroupInfo({ groupId, members, user }) {
  const [groupInfo, setGroupInfo] = useState({
    name: "",
    description: "",
    photo: "",
    membersCount: 0,
    type: "",
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    photo: null,
  });

  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // <-- edit mode
  const numericGroupId = Number(groupId);

  // 🔹 Fetch group info
  useEffect(() => {
    const fetchGroupInfo = async () => {
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

          setForm({
            name: data.group.name || "",
            description: data.group.description || "",
            photo: null,
          });
        }
      } catch (err) {
        console.error("Error fetching group info:", err);
      }
    };

    fetchGroupInfo();
  }, [groupId]);

  // 🔸 Update members count
  useEffect(() => {
    if (Array.isArray(members)) {
      setGroupInfo((prev) => ({ ...prev, membersCount: members.length }));
    }
  }, [members]);

  // 📸 Handle photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // 💾 Save all updates
  const handleSave = async () => {
    if (!form.name.trim()) return alert("Group name cannot be empty.");
    setSaving(true);

    const formData = new FormData();
    formData.append("group_id", numericGroupId);
    formData.append("name", form.name);
    formData.append("description", form.description);
    if (form.photo) formData.append("photo", form.photo);

    try {
      const res = await fetch(`${API_URL}/update_group_info.php`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Group info updated successfully!");
        setGroupInfo((prev) => ({
          ...prev,
          name: form.name,
          description: form.description,
          photo: data.new_photo ? `${API_URL}/${data.new_photo}` : prev.photo,
        }));
        setPreview("");
        setForm((prev) => ({ ...prev, photo: null }));
        setIsEditing(false); // <-- close edit mode
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network error while updating group info.");
    } finally {
      setSaving(false);
    }
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "20px",
        border: "1px solid #ddd",
        borderRadius: isMobile ? "0" : "12px",
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: isMobile ? "none" : "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* 🖼️ Photo */}
      <div style={{ position: "relative", width: "100%", height: "auto", background: "#f8f8f8" }}>
        <img
          src={preview || groupInfo.photo || "https://via.placeholder.com/600x300?text=No+Photo"}
          alt="Group Cover"
          style={{ width: "100%", height: "auto", objectFit: "cover" }}
        />
        {isEditing && user?.role === "admin" && (
          <label
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "#007bff",
              color: "white",
              padding: "6px 10px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            📷 Change Photo
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
          </label>
        )}
      </div>

      {/* 📝 Info Section */}
      <div style={{ padding: "16px" }}>
        {isEditing ? (
          <>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Group Name"
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "16px",
                fontWeight: "500",
              }}
            />

            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Group Description"
              style={{
                width: "100%",
                height: "80px",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                resize: "none",
              }}
            />

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? "#999" : "#28a745",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                marginTop: "10px",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>

            <button
              onClick={() => setIsEditing(false)}
              style={{
                marginLeft: "10px",
                background: "#dc3545",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                marginTop: "10px",
                cursor: "pointer",
              }}
            >
              ❌ Cancel
            </button>
          </>
        ) : (
          <>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "600", color: "#222" }}>
              {groupInfo.name}
            </h2>
            <p style={{ margin: "8px 0", fontSize: "14px", color: "#555" }}>
              {groupInfo.description}
            </p>
            {user?.role === "admin" && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                ✏️ Update
              </button>
            )}
          </>
        )}

        <div style={{ marginTop: "12px", color: "#666", fontSize: "13px" }}>
          <span>Type: {groupInfo.type || "Public"}</span> ·{" "}
          <span>Members: {groupInfo.membersCount}</span>
        </div>
      </div>
    </div>
  );
}
