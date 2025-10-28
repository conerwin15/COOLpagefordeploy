import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [visibleCards, setVisibleCards] = useState({});
  const API_URL = process.env.REACT_APP_API_URL;
  const cardsRef = useRef([]);

  // Convert URLs to clickable links
  const createLinkifiedText = (text) => {
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb">$1</a>'
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

  if (loading)
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader}></div>
        <p style={{ color: "#555" }}>Loading events...</p>
      </div>
    );

  const limitedEvents = events.slice(0, 3);

  return (
    <div style={styles.container}>
      <h4 style={styles.header}>
        COOL <span style={styles.highlight}>Event Activities</span>
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
                    style={{ ...styles.description, whiteSpace: "pre-wrap" }}
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

                  <Link to={`/events/${event.id}`} style={styles.button}>
                    View Details
                  </Link>
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
            View All Events
          </Link>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "100%",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#1a1a1a",
  },
  highlight: {
    background: "linear-gradient(90deg, #007bff, #00c6ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  list: { display: "flex", flexDirection: "column", gap: "20px" },
  card: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  mediaWrapper: { width: "100%", height: "200px", overflow: "hidden" },
  media: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    marginTop: "10px",
  },
  noMedia: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    color: "#999",
    background: "linear-gradient(135deg, #e9ecef, #dee2e6)",
  },
  content: { padding: "15px", display: "flex", flexDirection: "column" },
  title: { fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" },
  description: {
    fontSize: "0.95rem",
    color: "#555",
    marginBottom: "10px",
    lineHeight: 1.4,
  },
  seeMoreButton: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    padding: 0,
    marginBottom: "10px",
    alignSelf: "flex-start",
  },
  meta: { fontSize: "0.85rem", color: "#777", marginBottom: "12px" },
  button: {
    display: "inline-block",
    textDecoration: "none",
    background: "none",
    color: "#0d42f1ff",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: "500",
    alignSelf: "flex-start",
  },
  viewAllButton: {
    display: "inline-block",
    textDecoration: "none",
    background: "linear-gradient(90deg, #007bff, #00c6ff)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "500",
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
