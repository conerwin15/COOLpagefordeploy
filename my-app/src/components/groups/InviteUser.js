// src/groups/InviteUser.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./groupdesign/ButtonGroup.css"

const InviteUser = ({ user, onRefresh }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState([]);
  const { groupId } = useParams();
  const [requestSent, setRequestSent] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  // Toggle invite popup
  const togglePopup = () => {
    setShowPopup(!showPopup);
    setMessage('');
    setQuery('');
    setSuggestions([]);
    setSelectedUserId(null);
  };

  // Search users
  const searchUsers = async (q) => {
    setQuery(q);
    if (q.length < 2) return setSuggestions([]);
    try {
      const res = await fetch(`${API_URL}/search_users.php?q=${q}`);
      const data = await res.json();
      if (data.success) setSuggestions(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  // Invite user
  const handleInvite = async () => {
    if (!groupId || !selectedUserId || !user?.id) {
      return setMessage("⚠️ Missing group_id, user_id (invitee), or invited_by");
    }
    try {
      const res = await fetch(`${API_URL}/invite_user_to_group.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, user_id: selectedUserId, invited_by: user.id }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (data.success && onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setMessage('❌ Error inviting user.');
    }
  };

  // Join group
  const handleJoinGroup = async () => {
  if (!groupId || !user?.id) return;
  try {
    const res = await fetch(`${API_URL}/join_group.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: groupId, user_id: user.id }),
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) {
      setRequestSent(true); // ✅ mark that request has been sent
      if (onRefresh) onRefresh();
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error joining the group.");
  }
};

// Cancel request
const handleCancelRequest = async () => {
  if (!groupId || !user?.id) return;

  try {
    const res = await fetch(`${API_URL}/cancel_join_request.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: groupId,   // must match server-side expected field
        user_id: user.id,    // must match server-side expected field
      }),
    });

    const data = await res.json();

    if (data.success) {
      setRequestSent(false);
      alert(data.message);
      if (onRefresh) onRefresh();
    } else {
      alert("❌ " + (data.message || "Failed to cancel request"));
    }
  } catch (err) {
    console.error("Cancel request error:", err);
    alert("❌ Network or server error cancelling the request.");
  }
};

  // Leave group
  const handleLeaveGroup = async () => {
    if (!groupId || !user?.id) return;
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      const res = await fetch(`${API_URL}/leave_group.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, user_id: user.id }),
      });
      const data = await res.json();
      alert(data.message);
      if (data.success && onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("❌ Error leaving the group.");
    }
  };

  // Fetch group members
  const fetchGroupMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/get_group_members.php?group_id=${groupId}`);
      const data = await res.json();
      if (data.success) setMembers(data.members);
    } catch (err) {
      console.error('Error fetching group members:', err);
    }
  };

  useEffect(() => {
    if (groupId) fetchGroupMembers();
  }, [groupId]);


  
  // Profile picture helper
  const getProfilePic = (pic) => {
    if (!pic) return '/default-avatar.png';
    return pic.startsWith('http') ? pic : `${API_URL}/uploads/${pic}`;
  };

const getProfilePic2 = (pic) => {
  const fallback = '/default-avatar.png'; // fallback image
  if (!pic) return fallback;

  // If it's already a full URL, use it as is
  if (/^https?:\/\//i.test(pic)) return pic;

  // Remove duplicate 'uploads/' if present
  const cleanedPic = pic.replace(/^uploads\/+/i, 'uploads/');

  // Prepend API base URL
  const base = process.env.REACT_APP_API_URL || '';
  return base ? `${base}/${cleanedPic}` : `/${cleanedPic}`;
};

  

  // Check if user is a member
  const isMember = user && Array.isArray(members) && members.some(m => m.id === user.id);

  return (
    <div>
      {/* Action buttons */}
      {user && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
          {isMember ? (
            <>
              <button className="btn-approve"
                onClick={togglePopup}
      
              >
                Invite User
              </button>

              <button className="btn-cancel"
                onClick={handleLeaveGroup}
                
              >
                Leave Group
              </button>
            </>
          ) : (
<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
  <button
    onClick={requestSent ? handleCancelRequest : handleJoinGroup}
    className={requestSent ? 'button btn-cancel' : 'button btn-approve'}
  >
    {requestSent ? 'Cancel Request' : 'Join Group'}
  </button>
</div>

          )}
        </div>
      )}

      {/* Group Members List */}
      <div
        style={{
          marginBottom: '20px',
          background: '#f9f9f9',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h4 style={{ marginBottom: '12px', color: '#333', fontSize: '18px' }}>Group Members</h4>

        {members.length === 0 ? (
          <p style={{ fontStyle: 'italic', fontSize: '14px', color: '#888' }}>No members yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {members.map((member) => (
              <li
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                }}
              >
                <img
                  src={getProfilePic(member.profile_pic)}
                  alt={member.username}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '12px',
                  }}
                />
                <div>
                  <span style={{ fontWeight: 500, color: '#333' }}>{member.username}</span>
                  <br />
                  <small style={{ color: '#555' }}>
                    {member.role ? member.role.toUpperCase() : member.typeofuser ? member.typeofuser.toUpperCase() : 'MEMBER'}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Invite Popup */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            zIndex: 1000,
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <h3>Invite User to Group</h3>

          <input
            type="text"
            value={query}
            onChange={(e) => searchUsers(e.target.value)}
            placeholder="Search user by name"
            style={{ width: '100%', padding: '8px', marginTop: '10px' }}
          />

          {suggestions.length > 0 && (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                marginTop: '8px',
                background: '#f1f1f1',
                borderRadius: '4px',
                maxHeight: '150px',
                overflowY: 'auto',
              }}
            >
              {suggestions.map((u) => (
                <li
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id) || setQuery(u.username) || setSuggestions([])}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                 <img
  src={getProfilePic2(u.profile_pic)}
  alt={u.username}
  style={{
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '8px',
  }}
/>
                  {u.username}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleInvite}
            style={{
              marginTop: '10px',
              padding: '10px',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Invite
          </button>

          {message && (
            <p
              style={{
                marginTop: '10px',
                color: message.includes('⚠️') || message.includes('❌') ? 'red' : 'green',
              }}
            >
              {message}
            </p>
          )}

          <button
            onClick={togglePopup}
            style={{
              marginTop: '15px',
              padding: '6px 10px',
              background: '#ccc',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default InviteUser;
