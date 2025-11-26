import React, { useState, useEffect } from "react";

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
  const [allGroups, setAllGroups] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [selectedTab, setSelectedTab] = useState("my");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost/coolpage/my-app/backend";

  // ✅ Fetch groups
  const fetchGroups = async () => {
    if (!user?.id) return;
    try {
      let url =
        user?.role === "admin"
          ? `${API_URL}/get_all_groups.php`
          : `${API_URL}/get_groups.php?user_id=${user.id}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        if (user?.role === "admin") {
          setAllGroups(data.groups || []);
        } else {
          setMyGroups(data.my_groups || []);
          setPendingInvites(data.pending_invites || []);
          setSentInvites(data.sent_invites || []);
        }
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
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

  // ✅ Create new group (Admin only)
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setMessage("⚠️ Group name is required.");
      setMessageType("warning");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("description", description);
      formData.append("visibility", visibility);
      formData.append("created_by", user?.id);
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

  // ✅ Delete group (Admin only)
  const deleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      const res = await fetch(`${API_URL}/delete_group.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId, user_id: user?.id }),
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

  if (!user) {
    return <p style={{ textAlign: "center" }}>Loading user...</p>;
  }

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
      {/* ✅ Admin Badge */}
      {user?.role === "admin" && (
        <div
          style={{
            background: "#ffd7d7",
            color: "#d32f2f",
            padding: "6px 12px",
            borderRadius: "5px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          👑 Admin Panel
        </div>
      )}

      {/* ✅ Create button visible only to admin */}
      {user?.role === "admin" && (
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: "flex",
            justifyContent: "center",
            backgroundColor: "transparent",
            color: "#007bff",
            width: "100%",
            padding: "10px 16px",
            border: "2px solid #007bff",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "10px",
            fontWeight: "bold",
          }}
        >
          {showForm ? "Cancel" : "➕ Create Group"}
        </button>
      )}

      {/* ✅ Group creation form (only admin) */}
      {user?.role === "admin" && showForm && (
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

      {/* ✅ Feedback messages */}
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
      {user?.role === "admin" ? (
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
          {/* ✅ Non-admin users see their own groups */}
          <h3>My Groups</h3>
          {myGroups.length === 0 ? (
            <p>No groups found.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {myGroups.map((g) => (
                <li
                  key={g.id}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #ccc",
                    background: "#fff",
                  }}
                >
                  <strong>{g.name}</strong>
                  <p>{g.description || "No description"}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default CreateGroup;
