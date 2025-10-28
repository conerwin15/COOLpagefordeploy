import React, { useState } from "react";
import Header from "../headers/guestheader";

const AddEventActivity = ({ onClose }) => {
  const [form, setForm] = useState({
    event_name: "",
    description: "",
    event_date: "",
    location: "",
    country: "",
    organizer: "",
    link: "",
  });
  const [media, setMedia] = useState({ file: null, type: "", preview: "" });

  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const type = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
      ? "video"
      : null;
    if (!type) return alert("Only images and videos are allowed");
    const reader = new FileReader();
    reader.onloadend = () => setMedia({ file, type, preview: reader.result });
    reader.readAsDataURL(file);
  };

  const removeMedia = () => setMedia({ file: null, type: "", preview: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in form) formData.append(key, form[key]);
    if (media.file) formData.append("media", media.file);
    formData.append("created_by", 1);

    const res = await fetch(`${API_URL}/add_cool_activity.php`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) {
      setForm({
        event_name: "",
        description: "",
        event_date: "",
        location: "",
        country: "",
        organizer: "",
        link: "",
      });
      removeMedia();
    }
  };

  const countries = [
    "Philippines",
    "Singapore",
    "Malaysia",
    "Indonesia",
    "Thailand",
    "Vietnam",
    "Japan",
    "South Korea",
    "United States",
    "United Kingdom",
  ];

  return (
    <>
      <Header />
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.formContainer} onClick={(e) => e.stopPropagation()}>
          <button style={styles.closeButton} onClick={onClose}>
            ✖
          </button>

          <h3 style={styles.title}>Add Event Activity</h3>

          <form onSubmit={handleSubmit} style={styles.form}>
            {[
              "event_name",
              "description",
              "event_date",
              "location",
              "organizer",
              "link",
            ].map((field) => (
              <div key={field} style={styles.formGroup}>
                <label style={styles.label}>
                  {field.replace("_", " ").toUpperCase()}
                </label>
                {field === "description" ? (
                  <textarea
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="Enter event description..."
                  />
                ) : (
                  <input
                    type={field === "event_date" ? "date" : "text"}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder={`Enter ${field.replace("_", " ")}`}
                  />
                )}
              </div>
            ))}

            {/* Country Dropdown */}
            <div style={styles.formGroup}>
              <label style={styles.label}>COUNTRY</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select a country</option>
                {countries.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <label style={styles.label}>Media (Image/Video)</label>
            {!media.preview ? (
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                style={styles.fileInput}
              />
            ) : (
              <div style={styles.preview}>
                {media.type === "image" ? (
                  <img
                    src={media.preview}
                    alt="preview"
                    style={styles.mediaPreview}
                  />
                ) : (
                  <video
                    src={media.preview}
                    controls
                    style={styles.mediaPreview}
                  />
                )}
                <button
                  type="button"
                  style={styles.removeButton}
                  onClick={removeMedia}
                >
                  ✖
                </button>
              </div>
            )}

            <button type="submit" style={styles.submitButton}>
              + Add Event
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(15, 15, 25, 0.6)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    zIndex: 9999,
  },
  formContainer: {
    position: "relative",
    width: "100%",
    maxWidth: 520,
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,255,0.9))",
    borderRadius: 20,
    padding: "30px 25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    overflowY: "auto",
    maxHeight: "90vh",
    fontFamily: "'Inter', sans-serif",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 15,
    fontSize: 18,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#666",
    transition: "0.3s",
  },
  title: {
    textAlign: "center",
    background: "linear-gradient(90deg, #007bff, #6f42c1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 20,
  },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontWeight: 600, fontSize: 14, color: "#333" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    outline: "none",
    fontSize: 14,
    transition: "all 0.3s ease",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    resize: "vertical",
    outline: "none",
    fontSize: 14,
    transition: "all 0.3s ease",
    minHeight: 80,
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    outline: "none",
    fontSize: 14,
    backgroundColor: "#fff",
    appearance: "none",
    backgroundImage:
      "url('data:image/svg+xml;utf8,<svg fill=\"%23666\" height=\"24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "16px",
  },
  fileInput: {
    border: "1px solid #ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    cursor: "pointer",
  },
  preview: { position: "relative", marginTop: 5 },
  mediaPreview: {
    width: "100%",
    maxHeight: 220,
    objectFit: "cover",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
  },
  submitButton: {
    padding: "12px",
    background: "linear-gradient(90deg, #007bff, #6f42c1)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 600,
    marginTop: 15,
    transition: "all 0.3s ease",
  },
};

export default AddEventActivity;
