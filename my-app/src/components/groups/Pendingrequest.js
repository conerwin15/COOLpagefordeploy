import React, { useEffect, useState } from "react";
import "./groupdesign/ButtonGroup.css"
const API_URL = process.env.REACT_APP_API_URL;

export default function GroupJoinRequests({ groupId, adminId, user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Load pending requests (only if user is admin)
  useEffect(() => {
    if (!user || user.id !== adminId) {
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const res = await fetch(`${API_URL}/get_pending_requests.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group_id: groupId, admin_id: adminId }),
        });
        const data = await res.json();
        if (data.success) {
          setRequests(data.pending_requests);
        } else {
          setMessage(data.message);
        }
      } catch (err) {
        setMessage("❌ Server error");
      }
      setLoading(false);
    };
    fetchRequests();
  }, [groupId, adminId, user]);

  // Approve/Reject
  const handleAction = async (memberId, action) => {
    try {
      const res = await fetch(`${API_URL}/handle_request.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId, action, admin_id: adminId }),
      });
      const data = await res.json();
      setMessage(data.message);

      if (data.success) {
        setRequests(requests.filter((r) => r.member_id !== memberId));
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  // 🔐 If not admin, don't show anything
  if (!user || user.role !== "admin") {
    return <p style={{ color: "gray" }}>⚠️ Only admins can view join requests.</p>;
  }
  if (loading) return <p>⏳ Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>

      {message && <p style={{ color: "red" }}>{message}</p>}
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {requests.map((req) => (
            <li
              key={req.member_id}
              style={{
                background: "#fff",
                padding: "12px",
                margin: "10px 0",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{req.username}</strong> ({req.email}) <br />
                <small>Requested at: {req.requested_at}</small>
              </div>
              <div>
                <button className="btn-approve" 
                  
                  onClick={() => handleAction(req.member_id, "approve")}
                >
                   Approve
                </button>
                <button
                 className="btn-cancel"
                  onClick={() => handleAction(req.member_id, "reject")}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
