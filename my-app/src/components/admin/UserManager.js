import React, { useEffect, useState } from "react";
import DeleteButton from "../icon/deleteicon";
import Header from "../headers/headerfornews";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_URL = process.env.REACT_APP_API_URL;

export default function UserManager({ user }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    password: "",
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users/get_users.php`);
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
          setFiltered(data.users);
        } else throw new Error("Failed to fetch users");
      } catch (err) {
        console.error(err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Search filter
  useEffect(() => {
    const filteredData = users.filter(
      (u) =>
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.country && u.country.toLowerCase().includes(search.toLowerCase()))
    );
    setFiltered(filteredData);
    setCurrentPage(1);
  }, [search, users]);

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_URL}/users/delete_user.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        alert("User deleted successfully!");
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch {
      alert("Error deleting user");
    }
  };

  // Change user type
  const handleChangeType = async (id, newType) => {
    try {
      const res = await fetch(`${API_URL}/users/update_user_type.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, typeofuser: newType }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, typeofuser: newType } : u))
        );
        alert("User type updated!");
      } else alert("Failed to update user type");
    } catch {
      alert("Error updating user type");
    }
  };

  // Edit modal
  const handleEdit = (u) => {
    setEditingUser(u);
    setEditForm({
      first_name: u.first_name,
      last_name: u.last_name,
      password: "",
    });
  };

  const handleSaveEdit = async () => {
    const { first_name, last_name, password } = editForm;
    if (!first_name || !last_name)
      return alert("First and last name cannot be empty");

    try {
      const res = await fetch(`${API_URL}/users/update_user_info.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          first_name,
          last_name,
          password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id ? { ...u, first_name, last_name } : u
          )
        );
        alert("User info updated successfully!");
        setEditingUser(null);
      } else alert("Failed to update user info");
    } catch {
      alert("Error updating user info");
    }
  };

  // Excel Download
  const downloadExcel = () => {
    if (users.length === 0) {
      alert("No users to export.");
      return;
    }

    const excelData = users.map((u) => ({
      ID: u.id,
      Name: `${u.first_name} ${u.last_name}`,
      Email: u.email,
      Password: u.password || "N/A",
      Country: u.country,
      Type: u.typeofuser,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, "user_list.xlsx");
  };

  // Pagination
  const start = (currentPage - 1) * usersPerPage;
  const currentUsers = filtered.slice(start, start + usersPerPage);
  const totalPages = Math.ceil(filtered.length / usersPerPage);

  if (loading) return <p style={{ textAlign: "center" }}>Loading users...</p>;
  if (error)
    return (
      <p style={{ color: "red", textAlign: "center", fontWeight: "500" }}>
        {error}
      </p>
    );

  return (
    <>
      <Header />
      <div
        style={{
          maxWidth: "1000px",
          margin: "40px auto",
          padding: "20px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          User Management
        </h2>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search by name, email, or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        {/* Excel download button */}
        <button
          onClick={downloadExcel}
          style={{
            background: "#28a745",
            color: "white",
            padding: "10px 16px",
            borderRadius: "6px",
            border: "none",
            marginBottom: "15px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ⬇️ Download Excel
        </button>

        {/* ⭐ USER COUNT (the part you requested!) */}
        <p
          style={{
            fontWeight: "600",
            marginBottom: "15px",
            fontSize: "16px",
          }}
        >
          Total Users: {filtered.length}
        </p>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              borderRadius: "10px",
              minWidth: "600px",
            }}
          >
            <thead style={{ background: "#007bff", color: "#fff" }}>
              <tr>
                <th style={thStyle}>Profile</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Country</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((u, index) => (
                <tr
                  key={u.id}
                  style={{
                    background: index % 2 === 0 ? "#fafafa" : "#fff",
                    textAlign: "center",
                  }}
                >
                  <td style={tdStyle}>
                    <img
                      src={
                        u.profile_pic
                          ? u.profile_pic.startsWith("http")
                            ? u.profile_pic
                            : `${API_URL}/uploads/${u.profile_pic}`
                          : "https://via.placeholder.com/40"
                      }
                      alt={u.username}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    {u.first_name} {u.last_name}
                  </td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.country}</td>
                  <td style={tdStyle}>
                    <select
                      value={u.typeofuser}
                      onChange={(e) => handleChangeType(u.id, e.target.value)}
                      style={{ padding: "5px", borderRadius: "6px" }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={tdStyle}>
                    {user?.role === "admin" && (
                      <>
                        <button onClick={() => handleEdit(u)} style={btnEdit}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(u.id)} style={btnDelete}>
                          <DeleteButton />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                margin: "0 5px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #007bff",
                background: currentPage === i + 1 ? "#007bff" : "#fff",
                color: currentPage === i + 1 ? "#fff" : "#007bff",
                cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <h3>Edit User Info</h3>
              <label>First Name:</label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, first_name: e.target.value })
                }
                style={inputStyle}
              />
              <label>Last Name:</label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, last_name: e.target.value })
                }
                style={inputStyle}
              />
              <label>New Password:</label>
              <input
                type="password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                placeholder="Leave blank to keep current password"
                style={inputStyle}
              />
              <div style={{ textAlign: "right", marginTop: "15px" }}>
                <button onClick={() => setEditingUser(null)} style={btnCancel}>
                  Cancel
                </button>
                <button onClick={handleSaveEdit} style={btnSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Styles
const thStyle = { padding: "10px", fontWeight: "600" };
const tdStyle = { padding: "10px" };
const btnEdit = {
  background: "#1890ff",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "5px",
  marginRight: "5px",
  cursor: "pointer",
};
const btnDelete = {
  background: "#f5f5f5ff",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "5px",
  cursor: "pointer",
};
const btnCancel = {
  background: "#999",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  marginRight: "10px",
  cursor: "pointer",
};
const btnSave = {
  background: "#28a745",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
};
const inputStyle = {
  width: "100%",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  marginBottom: "10px",
};
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};
const modalBox = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "90%",
  maxWidth: "400px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
};
