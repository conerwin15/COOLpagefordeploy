import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../headers/headerfornews";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    message: "",
  });

  const API_URL = process.env.REACT_APP_API_URL;

  // 🔗 Convert URLs to clickable links
 const createLinkifiedText = (text) => {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb; word-break:break-word; overflow-wrap:anywhere; text-decoration:underline;">$1</a>'
  );
};

  useEffect(() => {
    fetch(`${API_URL}/get_event_activities.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const found = data.data.find((ev) => String(ev.id) === String(id));
          setEvent(found || null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching event details:", err);
        setLoading(false);
      });
  }, [id, API_URL]);

  // ✅ Handle share button
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/events/${event.id}`;
    const shareText = `Check out this event: ${event.event_name}`;

    if (navigator.share) {
      navigator
        .share({
          title: event.event_name,
          text: shareText,
          url: shareUrl,
        })
        .catch((err) => {
          console.warn("Native share failed:", err);
          window.open(shareUrl, "_blank");
        });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  // ✅ Contact form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.contact || !formData.message) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/contact_submit.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert("Thank you for reaching out! We’ll get back to you soon.");
        setFormData({ name: "", email: "", contact: "", message: "" });
        setShowContactModal(false);
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Contact form submission failed:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  if (loading) return <p style={styles.loadingText}>Loading event details...</p>;
  if (!event) return <p style={styles.loadingText}>Event not found.</p>;

  const isMobile = window.innerWidth <= 480;

  return (
    <>
      <Header />
      <div style={styles.container}>
        {event.media && (
          <div style={styles.mediaWrapper}>
            {event.media_type === "image" ? (
              <img
                src={
                  event.media.startsWith("http")
                    ? event.media
                    : `${API_URL}/uploads/events/${event.media}`
                }
                alt={event.event_name}
                style={styles.media}
              />
            ) : (
              <video
                src={
                  event.media.startsWith("http")
                    ? event.media
                    : `${API_URL}/uploads/events/${event.media}`
                }
                controls
                style={styles.media}
              />
            )}
          </div>
        )}

        <h4 style={styles.title}>{event.event_name}</h4>

        <p
  style={{
    ...styles.description,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  }}
  dangerouslySetInnerHTML={{
    __html: createLinkifiedText(event.description),
  }}
/>

        <p style={styles.meta}>
         Date: {new Date(event.event_date).toLocaleDateString()} | Location:{" "}
          {event.location || "N/A"}, {event.country || "N/A"}
        </p>

        <div style={styles.buttonRow}>
          <button
            onClick={() => setShowContactModal(true)}
            style={styles.contactButton}
          >
            Contact Us
          </button>

          <button onClick={handleShare} style={styles.shareButton}>
            Share
          </button>

          <Link to="/" style={styles.backButton}>
            Back
          </Link>
        </div>
      </div>

      {/* ✅ Contact Us Modal */}
      {showContactModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: "10px" }}>Contact Us</h3>
            <form onSubmit={handleSubmitContact} style={styles.form}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                style={styles.input} required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input} required
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact Number"
                value={formData.contact}
                onChange={handleInputChange}
                style={styles.input} required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleInputChange}
                style={styles.textarea} required
              ></textarea>

              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitButton}>
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
const isMobile = window.innerWidth <= 480; // adjust breakpoint if needed

// ✅ Styles
const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  mediaWrapper: {
    marginBottom: "20px",
  },
  media: {
    width: "100%",
    maxHeight: "400px",
   
    borderRadius: "12px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "10px",
    textAlign: "center",
  },
  description: {
    whiteSpace: "pre-wrap",
    fontSize: "1rem",
    color: "#555",
    marginBottom: "15px",
  },
  meta: {
    fontSize: "0.9rem",
    color: "#777",
    marginBottom: "20px",
    textAlign: "center",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
  },
  backButton: {
    background: "#e0e0e0",
    color: "#333",
   
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "500",
         padding: isMobile ? "4px 8px" : "6px 12px",
   
    fontSize: isMobile ? "0.8rem" : "1rem",
  },
  contactButton: {
    background: "#0d42f1",
    color: "#fff",
    border: "none",
  
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
     padding: isMobile ? "4px 8px" : "6px 12px",
   
    fontSize: isMobile ? "0.8rem" : "1rem",
  },
  shareButton: {
    background: "none",
    border: "1px solid #0d42f1",
    color: "#0d42f1",
 
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    padding: isMobile ? "4px 8px" : "6px 12px",
   
    fontSize: isMobile ? "0.8rem" : "1rem",
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
    color: "#555",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
  },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  textarea: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    minHeight: "80px",
  },
  modalButtons: { display: "flex", justifyContent: "space-between" },
  submitButton: {
    background: "#0d42f1",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  cancelButton: {
    background: "#ccc",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default EventDetails;
