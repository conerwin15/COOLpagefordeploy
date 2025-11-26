import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const EventList = (user) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded, sectionRef, setVisible] = useState({});
  const [visibleCards, setVisibleCards] = useState({});
  const [scrollIndex, setScrollIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    message: "",
  });

  const carouselRef = useRef(null);
  const cardsRef = useRef([]);
  const API_URL = process.env.REACT_APP_API_URL;

  const createLinkifiedText = (text) => {
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb">$1</a>'
    );
  };

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
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            setVisibleCards((prev) => ({ ...prev, [id]: true }));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardsRef.current.forEach((card) => card && observer.observe(card));
    return () => observer.disconnect();
  }, [events]);

  useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("data-id");
        setVisibleCards((prev) => ({
          ...prev,
          [id]: entry.isIntersecting,
        }));
      });
    },
    { threshold: 0.2 }
  );

  cardsRef.current.forEach((card) => card && observer.observe(card));

  return () => observer.disconnect();
}, [events]);
  // Auto rotate
  useEffect(() => {
    const interval = setInterval(() => {
      scrollRight();
    }, 10000);
    return () => clearInterval(interval);
  }, [events, scrollIndex]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollLeft = () => {
    if (!carouselRef.current) return;
    let newIndex = scrollIndex - 1;
    if (newIndex < 0) newIndex = events.length - 1;
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    if (!carouselRef.current) return;
    let newIndex = scrollIndex + 1;
    if (newIndex >= events.length) newIndex = 0;
    scrollToIndex(newIndex);
  };

const scrollToIndex = (index) => {
  if (!carouselRef.current) return;

  const container = carouselRef.current;
  const card = cardsRef.current[index];
  if (!card) return;

  const containerWidth = container.offsetWidth;
  const cardWidth = card.offsetWidth;
  const gap = window.innerWidth <= 768 ? 10 : 20;

  // Calculate center position
  const scrollPosition =
    card.offsetLeft - (containerWidth / 2 - cardWidth / 2) - gap / 2;

  container.scrollTo({
    left: scrollPosition,
    behavior: "smooth",
  });

  setScrollIndex(index);
};
  // Contact form handlers
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        alert("Thank you for reaching out! We’ll get back to you soon.");
        setFormData({ name: "", email: "", contact: "", message: "" });
        setShowContactModal(false);
      } else alert("Error: " + result.message);
    } catch (err) {
      console.error("Contact form submission failed:", err);
      alert("Something went wrong. Please try again later.");
    }
  };

  // Share handler
  const handleShare = (event) => {
    const shareUrl = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      navigator
        .share({ title: event.event_name, text: `Check this event: ${event.event_name}`, url: shareUrl })
        .catch(() => window.open(shareUrl, "_blank"));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };


    const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`${API_URL}/delete_event.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: eventId }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Event deleted successfully.");
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        alert("Failed to delete event: " + data.message);
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Something went wrong while deleting.");
    }
  };

  

  if (loading)
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader}></div>
        <p style={{ color: "#555" }}>Loading events...</p>
      </div>
    );

    

 return (
  
  <div style={styles.container} >
    
    {/* ✅ Header */}
    <h4 style={styles.header} >
      Series of <span style={styles.highlight}>Expert Speakers</span>
    </h4>

    <div style={{ position: "relative" }}>
      {/* ⬅️ Left Arrow */}
      <button style={styles.arrowLeft} onClick={scrollLeft}>
        &#10094;
      </button>

      {/* 🎠 Carousel */}
      <div
        ref={carouselRef}
       style={{
    display: "flex",
    overflowX: "auto",
    overflowY: "hidden",
    gap: "15px",
    padding: "10px", // add padding to prevent first/last card overlap
    justifyContent: "flex-start", // use flex-start for proper scroll
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
  }}
      >
        {events.length > 0 ? (
          events.map((event, index) => {
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
                  minWidth: "280px",
                  flexShrink: 0,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.6s ease",
                }}
              >
                {/* 🎞 Media */}
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

                {/* 📄 Content */}
                <div style={styles.content}>
                  <h3 style={styles.title}>{event.event_name}</h3>

                  <p
                    style={{
                      ...styles.description,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
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
                    📅 {new Date(event.event_date).toLocaleDateString()} |{" "}
                    {event.location || "N/A"} | {event.country || "N/A"}
                  </p>

                  {/* 🔘 Buttons */}
                  <div style={styles.buttonRow}>
                    <Link to={`/events/${event.id}`} style={styles.viewButton}>
                      View Details
                    </Link>
                    <button
                      onClick={() => setShowContactModal(true)}
                      style={styles.contactButton}
                    >
                      Contact Us
                    </button>
                    <button
                      onClick={() => handleShare(event)}
                      style={styles.shareButton}
                    >
                      Share
                    </button>

                    {/* 🗑️ Admin Delete */}
                    {user?.typeofuser === "admin" && (
                      <button
                        onClick={() => handleDelete(event.id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", color: "#666" }}>
            No events found.
          </p>
        )}
      </div>

      {/* ➡️ Right Arrow */}
      <button style={styles.arrowRight} onClick={scrollRight}>
        &#10095;
      </button>
    </div>

    {/* 🔗 View All */}
    {events.length > 3 && (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link to="/events" style={styles.viewAllButton}>
          View All Events
        </Link>
      </div>
    )}

    {/* 💬 Contact Modal */}
    {showContactModal && (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <h3>Contact Us</h3>
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

// Responsive styles
const isMobile = window.innerWidth <= 480;
const cardWidth = window.innerWidth <= 768 ? "400px" : "320px";

  const styles = {
  
container: {
  padding: "0",
  maxWidth: "100%",
  width: "1000px", // or any fixed width smaller than 100%
  margin: "100px auto", // ✅ centers horizontally
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
},

  header: {
    textAlign: "center",
    fontSize: isMobile ? "1.3rem" : "1.8rem",
    fontWeight: "700",
    marginBottom: "30px",
    color: "#1a1a1a",
    letterSpacing: "0.5px",
  },

  highlight: {
    background: "linear-gradient(90deg, #007bff, #00c6ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "linear-gradient(180deg, #ffffff 0%, #f7faff 100%)",
    borderRadius: "14px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    overflow: "hidden",
    width: "100%",
    maxWidth: cardWidth,
    minHeight: "380px",
    transform: "translateY(0px)",
    transition:
      "transform 0.4s ease, box-shadow 0.4s ease, background 0.3s ease",
  },

  cardHover: {
    transform: "translateY(-8px)",
    boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
  },

 mediaWrapper: {
    width: "100%",
    height: "200px",
    overflow: "hidden",
    backgroundColor: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  media: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noMedia: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    color: "#999",
    background: "linear-gradient(135deg, #e9ecef, #dee2e6)",
  },
  content: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: "16px 18px",
  },
  title: {
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "7px",
    lineHeight: "1.2",
    minHeight: "45px", // keeps titles aligned
  },
  description: {
    fontSize: "0.7rem",
    color: "#555",
    marginBottom: "10px",
    lineHeight: 1.5,
    flexGrow: 1, // pushes footer down evenly
  },
  seeMoreButton: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    padding: 0,
    marginBottom: "8px",
    alignSelf: "flex-start",
    fontSize: "0.65rem",
    fontWeight: "500",
  },
  meta: {
    fontSize: "0.6rem",
    color: "#777",
    marginBottom: "12px",
  },  
viewButton: {
    textDecoration: "none",
    background: "#e8f0ff",
    color: "#0d42f1",
    padding: isMobile ? "4px 8px" : "6px 8px",
    borderRadius: "6px",
    fontSize: isMobile ? "0.8rem" : "0.8rem",
margin:"3px",
  },
  contactButton: {
    background: "#0d42f1",
    color: "#fff",
    border: "none",
    padding: isMobile ? "4px 8px" : "6px 8px",
    borderRadius: "6px",
    fontSize: isMobile ? "0.8rem" : "0.8rem",
    cursor: "pointer",margin:"3px",
  },
  shareButton: {
    border: "1px solid #0d42f1",
    background: "none",
    color: "#0d42f1",
    padding: isMobile ? "4px 8px" : "6px 8px",
    borderRadius: "6px",
    fontSize: isMobile ? "0.8rem" : "0.8rem",
    cursor: "pointer",
margin:"3px",
  },
  viewAllButton: { display: "inline-block", textDecoration: "none", background: "linear-gradient(90deg, #007bff, #00c6ff)", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontWeight: "500" },
  loaderContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh" },
  loader: { width: "40px", height: "40px", border: "4px solid #e0e0e0", borderTop: "4px solid #007bff", borderRadius: "50%", animation: "spin 1s linear infinite" },
  arrowLeft: { position: "absolute", top: "50%", left: "-15px", transform: "translateY(-50%)", background: "#f9f9f970", color: "#007bff", border: "none", borderRadius: "50%", width: "35px", height: "35px", cursor: "pointer", zIndex: 10 },
  arrowRight: { position: "absolute", top: "50%", right: "-15px", transform: "translateY(-50%)", background: "#f9f9f9d9", color: "#007bff", border: "none", borderRadius: "50%", width: "35px", height: "35px", cursor: "pointer", zIndex: 10 },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: "20px", borderRadius: "12px", width: "90%", maxWidth: "400px", boxShadow: "0 6px 15px rgba(0,0,0,0.2)" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", border: "1px solid #ccc", borderRadius: "6px" },
  textarea: { padding: "10px", border: "1px solid #ccc", borderRadius: "6px", minHeight: "80px" },
  modalButtons: { display: "flex", justifyContent: "space-between" },
  submitButton: { background: "#0d42f1", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
  cancelButton: { background: "#ccc", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
};


export default EventList;
