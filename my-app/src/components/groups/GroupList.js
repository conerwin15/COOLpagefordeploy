import React, { useEffect, useState } from "react";
import Loading from "../icon/loading";

const GroupList = ({ user }) => {
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [outgoingInvites, setOutgoingInvites] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  // ✅ Fetch groups
  const fetchGroups = () => {
    if (!user?.id) return;
    setLoading(true);

    const url = user.role === "admin"
      ? `${API_URL}/get_all_groups.php` // new endpoint for admins
      : `${API_URL}/get_groups.php?user_id=${user.id}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (user.role === "admin") {
            setAllGroups(data.groups || []);
          } else {
            setMyGroups(data.my_groups || []);
            setPublicGroups(data.public_groups || []);
            setPendingInvites(data.pending_invites || []);
            setOutgoingInvites(data.outgoing_invites || []);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching groups:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  // ✅ Respond to invite
  const respondToInvite = async (groupId, action) => {
    try {
      const res = await fetch(`${API_URL}/respond_to_invite.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: groupId,
          user_id: user.id,
          action: action,
        }),
      });

      const data = await res.json();
      alert(data.message);
      fetchGroups();
    } catch (err) {
      console.error("Error responding to invite:", err);
      alert("Something went wrong.");
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
      alert(data.message);
      if (data.success) fetchGroups();
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("Failed to delete group.");
    }
  };

  if (loading) return <p><Loading /></p>;

  return (
    <div style={{ marginTop: "20px" }}>
      {/* ✅ If Admin - show all groups */}
      {user.role === "admin" ? (
        <>
   
          {allGroups.length > 0 ? (
            <ul>
              {allGroups.map((group) => (
                <li key={group.id} style={{ marginBottom: 8 }}>
                  <strong>{group.name}</strong> ({group.type})
                  <button
                    onClick={() => deleteGroup(group.id)}
                    style={{
                      marginLeft: 10,
                      padding: "4px 10px",
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No groups found.</p>
          )}
        </>
      ) : (
        <>
          {/* ✅ Pending Invites */}
          {pendingInvites.length > 0 && (
            <>
              <h4 style={{ color: "#eab308" }}>Pending Invites</h4>
              <ul>
                {pendingInvites.map((group) => (
                  <li key={group.id} style={{ marginBottom: 8 }}>
                    {group.name} (Invited by: {group.invited_by})
                    <div style={{ marginTop: 4 }}>
                      <button
                        onClick={() => respondToInvite(group.id, "accept")}
                        style={{
                          marginRight: 8,
                          padding: "4px 10px",
                          background: "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondToInvite(group.id, "decline")}
                        style={{
                          padding: "4px 10px",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ✅ My Groups */}
          <h4 style={{ marginTop: "20px" }}>My Groups</h4>
          {myGroups.length ? (
            <ul>
              {myGroups.map((group) => (
                <li key={group.id}>
                  {group.name} ({group.type})
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't joined any groups.</p>
          )}

          {/* ✅ Public Groups */}
          <h4 style={{ marginTop: "20px" }}>Public Groups</h4>
          {publicGroups.length ? (
            <ul>
              {publicGroups.map((group) => (
                <li key={group.id}>{group.name}</li>
              ))}
            </ul>
          ) : (
            <p>No public groups available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default GroupList;
