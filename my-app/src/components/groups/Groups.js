import React, { useEffect, useState } from "react";
import CreateGroupForm from "./CreateGroupForm";
import GroupList2 from "./GroupList2";
import GroupInvitations from "./GroupInvitations";
import AllGroups from "./AllGroups"; // ✅ Fixed name capitalization
import "./groupdesign/groupswrapper.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost/coolpage/my-app/backend";

export default function Groupswrapper({ user }) {
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [selectedTab, setSelectedTab] = useState("my");
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Detect if user is admin
  useEffect(() => {
    if (user && (user.role === "admin" || user.is_admin === 1)) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // ✅ Fetch groups for logged-in user
  const fetchGroups = async () => {
    try {
      const userIdParam = user?.id ? `user_id=${user.id}` : "";
      const url = `${API_URL}/get_groups.php?${userIdParam}&where=public`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setMyGroups(data.my_groups || []);
        setPublicGroups(data.public_groups || []);
        setPendingInvites(data.pending_invites || []);
        setSentInvites(data.sent_invites || []);
      } else {
        console.error("❌ Failed to fetch groups:", data.message);
      }
    } catch (err) {
      console.error("⚠️ Network error fetching groups:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  // ✅ Respond to group invite
  const respondToInvite = async (groupId, action) => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_URL}/respond_to_invite.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId, user_id: user.id, action }),
      });

      const data = await res.json();
      if (data.success) {
        fetchGroups();
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("⚠️ Network error:", err);
    }
  };

  // ✅ Delete a group (Admin or creator only)
  const deleteGroup = async (groupId) => {
    if (!user?.id) return alert("⚠️ You must be logged in to delete a group.");
    if (!isAdmin && !window.confirm("Are you sure you want to delete this group?")) return;

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
      console.error("⚠️ Network error deleting group:", err);
      alert("⚠️ Failed to delete group. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto" }}>
      {/* ✅ Group creation form (admin or normal user) */}
      {user && (
        <CreateGroupForm user={user} onGroupCreated={fetchGroups} />
      )}

      {/* ✅ Tabs */}
      <select
        value={selectedTab}
        onChange={(e) => setSelectedTab(e.target.value)}
        className="group-tabs"
      >
        {user && <option value="my">My Groups</option>}
        <option value="public">Public Groups</option>
        {user && <option value="pending">Pending Invites</option>}
        {user && <option value="sent">Sent Invites</option>}
        {isAdmin && <option value="admin">All Groups</option>}
      </select>

      {/* ✅ Show group lists */}
      <GroupList2
        myGroups={myGroups}
        publicGroups={publicGroups}
        selectedTab={selectedTab}
        isAdmin={isAdmin}
        deleteGroup={deleteGroup}
      />

      {/* ✅ Invitations */}
      {user && (
        <GroupInvitations
          pendingInvites={pendingInvites}
          sentInvites={sentInvites}
          selectedTab={selectedTab}
          respondToInvite={respondToInvite}
        />
      )}

      {/* ✅ Admin section */}
      {isAdmin && selectedTab === "admin" && (
        <div className="admin-section">
          <AllGroups 
           myGroups={myGroups}
        publicGroups={publicGroups}
        selectedTab={selectedTab}
            isAdmin={isAdmin}
            deleteGroup={deleteGroup}
          />
        </div>
      )}
    </div>
  );
}
