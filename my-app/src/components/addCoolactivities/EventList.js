import { AlignCenter } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [visibleCards, setVisibleCards] = useState({});
  const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    message: "",
  });

  const API_URL = process.env.REACT_APP_API_URL;
  const cardsRef = useRef([]);

  // Convert URLs to clickable links
 const createLinkifiedText = (text) => {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb; word-break:break-word; overflow-wrap:anywhere; text-decoration:underline;">$1</a>'
  );
};

  // Fetch events
  useEffect(() => {
    fetch(`${API_URL}/get_event_activities.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEvents(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, [API_URL]);

  // Intersection Observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-id");
          if (entry.isIntersecting) {
            setVisibleCards((prev) => ({ ...prev, [id]: true }));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [events]);

  // Expand / collapse description
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ Share handler
  const handleShare = (event) => {
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

  // ✅ Contact modal handlers
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

  if (loading)
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader}></div>
        <p style={{ color: "#555" }}>Loading events...</p>
      </div>
    );

  const limitedEvents = events.slice(0, 6);

  return (
    <div style={styles.container}>
      <h4 style={styles.header}>
        Series of <span style={styles.highlight}>Expert Speakers
 
</span>
      </h4>

      <div style={styles.list}>
        {limitedEvents.length > 0 ? (
          limitedEvents.map((event, index) => {
            const isExpanded = expanded[event.id] || false;
            const isVisible = visibleCards[event.id] || false;
            const descriptionText = isExpanded
              ? event.description
              : event.description.slice(0, 100);

            return (
              <div
                key={event.id}
                data-id={event.id}
                ref={(el) => (cardsRef.current[index] = el)}
                style={{
                  ...styles.card,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.8s ease",
                }}
              >
                <div style={styles.mediaWrapper}>
                  {event.media ? (
                    event.media_type === "image" ? (
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
                    )
                  ) : (
                    <div style={styles.noMedia}>No Media</div>
                  )}
                </div>

                <div style={styles.content}>
                  <h3 style={styles.title}>{event.event_name}</h3>

                  <p
                    style={{ ...styles.description, whiteSpace: "pre-wrap",  wordBreak: "break-word",    overflowWrap: "anywhere", }}
                    dangerouslySetInnerHTML={{
                      __html:
                        createLinkifiedText(descriptionText) +
                        (event.description.length > 100 && !isExpanded
                          ? "..."
                          : ""),
                    }}
                  />

                  {event.description.length > 100 && (
                    <button
                      onClick={() => toggleExpand(event.id)}
                      style={styles.seeMoreButton}
                    >
                      {isExpanded ? "See Less" : "See More"}
                    </button>
                  )}

                  <p style={styles.meta}>
                    Date: {new Date(event.event_date).toLocaleDateString()} |{" "}
                    {event.location || "N/A"} | {event.country || "N/A"}
                  </p>

                  <div style={styles.buttonRow}>
                    <Link to={`/events/${event.id}`} style={styles.viewButton}>
                      View Details
                    </Link>

                    {/* ✅ Contact Us Popup Trigger */}
                    <button
                      onClick={() => setShowContactModal(true)}
                      style={styles.contactButton}
                    >
                      Contact Us
                    </button>

                    {/* ✅ Share Button */}
                    <button
                      onClick={() => handleShare(event)}
                      style={styles.shareButton}
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", color: "#666" }}>No events found.</p>
        )}
      </div>

      {events.length > 3 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/events/guest" style={styles.viewAllButton}>
            View All          </Link> 
        </div>
      )}

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
                style={styles.input}
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact Number"
                value={formData.contact}
                onChange={handleInputChange}
                style={styles.input}
              />
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleInputChange}
                style={styles.textarea}
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
    </div>
  );
};
const isMobile = window.innerWidth <= 480; // adjust breakpoint if needed

// ✅ Styles
const styles = {
  container: {
  padding: "20px",
  fontFamily: "'Inter', sans-serif",
  maxWidth: "900px",
  margin: "0 auto",           // ✅ centers horizontally
  display: "flex",            // ✅ enables flexbox
  flexDirection: "column",
  alignItems: "center",       // ✅ centers items horizontally (inside)
  justifyContent: "center",   // ✅ centers items vertically (inside)
  textAlign: "center",        // ✅ centers text if needed
  minHeight: "100vh",         // optional — makes it fill full height for vertical centering
  boxSizing: "border-box",    // keep padding consistent
},
  header: { textAlign: "center", fontSize: "1.5rem", fontWeight: "700", margin:"10px" },
  highlight: {
    background: "linear-gradient(90deg, #007bff, #00c6ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  list: { display: "flex", flexDirection: "column", gap: "20px" },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  mediaWrapper: { width: "100%", height: "auto", overflow: "hidden", padding:"10px" },
  media: { width: "100%", height: "auto",},
  noMedia: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    background: "#f2f2f2",
    color: "#999",
  },
  content: { padding: "15px" },
  title: { fontSize: "1.2rem", fontWeight: "700" },
  description: { color: "#555", fontSize: "0.95rem", marginBottom: "10px",  wordBreak: "break-word",   overflowWrap: "anywhere", },
  meta: { color: "#777", fontSize: "0.85rem", marginBottom: "12px" },
  seeMoreButton: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    padding: 0,
  },
  buttonRow: { display: "flex", gap: "10px" },
 viewButton: {
    textDecoration: "none",
    background: "#e8f0ff",
    color: "#0d42f1",
    padding: isMobile ? "4px 8px" : "6px 12px",
    borderRadius: "6px",
    fontSize: isMobile ? "0.8rem" : "1rem",
  },
  contactButton: {
    background: "#0d42f1",
    color: "#fff",
    border: "none",
    padding: isMobile ? "4px 8px" : "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: isMobile ? "0.8rem" : "1rem",
  },
  shareButton: {
    border: "1px solid #0d42f1",
    background: "none",
    color: "#0d42f1",
    padding: isMobile ? "4px 8px" : "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: isMobile ? "0.8rem" : "1rem",
  },
  viewAllButton: {
    background: "linear-gradient(90deg, #007bff, #00c6ff)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "8px",
    textDecoration: "none",
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
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default EventList;
