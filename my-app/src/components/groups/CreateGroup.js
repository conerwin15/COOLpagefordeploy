import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CreateGroup = ({ user }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]); // ✅ for admin
  const [pendingInvites, setPendingInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [selectedTab, setSelectedTab] = useState("my");

  const API_URL = "http://localhost/coolpage/my-app/backend";

  const fetchGroups = async () => {
    try {
      let url =
        user.role === "admin"
          ? `${API_URL}/get_all_groups.php`
          : `${API_URL}/get_groups.php?user_id=${user.id}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        if (user.role === "admin") {
          setAllGroups(data.groups || []);
        } else {
          setMyGroups(data.my_groups || []);
          setPublicGroups(data.public_groups || []);
          setPendingInvites(data.pending_invites || []);
          setSentInvites(data.sent_invites || []);
        }
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchGroups();
  }, [user]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ✅ Create new group
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setMessage("⚠️ Group name is required.");
      setMessageType("warning");
      return;
    }

    const isDuplicate = myGroups.some(
      (g) => g.name.toLowerCase() === groupName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setMessage("⚠️ You already have a group with this name.");
      setMessageType("warning");
      return;
    }

    if (!user || !user.id) {
      setMessage("❌ You must be logged in to create a group.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("description", description);
      formData.append("visibility", visibility);
      formData.append("created_by", user.id);
      if (groupPhoto) formData.append("group_photos", groupPhoto);

      const res = await fetch(`${API_URL}/create_group.php`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setMessageType("success");
        setGroupName("");
        setDescription("");
        setVisibility("public");
        setGroupPhoto(null);
        setShowForm(false);
        fetchGroups();
      } else {
        setMessage(`❌ ${data.message}`);
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network or server error. Please try again.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Respond to invite
  const respondToInvite = async (groupId, action) => {
    try {
      const res = await fetch(`${API_URL}/respond_to_invite.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: groupId,
          user_id: user.id,
          action,
        }),
      });

      const data = await res.json();
      alert(data.message);
      fetchGroups();
    } catch (err) {
      console.error("Error:", err);
      alert("Network error.");
    }
  };

  // ✅ Delete group (Admin only)
  const deleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      const res = await fetch(`${API_URL}/delete_group.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId, user_id: user.id }),
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Group deleted successfully.");
        fetchGroups();
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete group.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
        maxWidth: "700px",
        margin: "20px auto",
      }}
    >
      <button
        onClick={() => setShowForm(!showForm)}
        disabled={!user}
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: "transparent",
          color: user ? "#007bff" : "#888",
          width: "100%",
          padding: "10px 16px",
          border: `2px solid ${user ? "#007bff" : "#ccc"}`,
          borderRadius: "6px",
          cursor: user ? "pointer" : "not-allowed",
          marginBottom: "1px",
          opacity: user ? 1 : 0.6,
          fontWeight: "bold",
        }}
      >
        {showForm ? "Cancel" : " Create Group"}
      </button>

      {/* ✅ Group creation form */}
      {showForm && (
        <div style={{ marginBottom: "50px" }}>
          <h3 style={{ marginBottom: "20px", marginTop: "20px" }}>
            Create a New Group
          </h3>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Group description (optional)"
            rows={3}
            style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
          />
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setGroupPhoto(e.target.files[0])}
            style={{ marginBottom: "15px" }}
          />
          <button
            onClick={handleCreateGroup}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#6c757d" : "#28a745",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "4px",
              cursor: submitting ? "not-allowed" : "pointer",
              width: "100%",
            }}
          >
            {submitting ? "Submitting..." : "Submit Group"}
          </button>
        </div>
      )}

      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "6px",
            backgroundColor:
              messageType === "success"
                ? "#d4edda"
                : messageType === "error"
                ? "#f8d7da"
                : "#fff3cd",
            color:
              messageType === "success"
                ? "#155724"
                : messageType === "error"
                ? "#721c24"
                : "#856404",
            border:
              messageType === "success"
                ? "1px solid #c3e6cb"
                : messageType === "error"
                ? "1px solid #f5c6cb"
                : "1px solid #ffeeba",
            marginBottom: "20px",
          }}
        >
          {message}
        </div>
      )}

      <hr style={{ margin: "20px 0" }} />

      {/* ✅ Admin View */}
      {user.role === "admin" ? (
        <>
          <h3 style={{ color: "#d32f2f" }}>All Groups (Admin)</h3>
          {allGroups.length === 0 ? (
            <p>No groups available.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {allGroups.map((g) => (
                <li
                  key={g.id}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #ccc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>{g.name}</strong>{" "}
                    <span style={{ fontSize: "12px", color: "#888" }}>
                      ({g.type})
                    </span>
                    <p style={{ margin: "6px 0 0" }}>
                      {g.description || "No description."}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteGroup(g.id)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          {/* ✅ Non-admin (your existing code for tabs) */}
          {/* Your tab selection + groups display remains unchanged */}
        </>
      )}
    </div>
  ); 
};
 
export default CreateGroup;
