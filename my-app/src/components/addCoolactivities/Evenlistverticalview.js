import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [visibleCards, setVisibleCards] = useState({});
  const [scrollIndex, setScrollIndex] = useState(0);
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
    const cardWidth = cardsRef.current[0]?.offsetWidth || 320;
    carouselRef.current.scrollTo({ left: index * (cardWidth + 20), behavior: "smooth" });
    setScrollIndex(index);
  };

  if (loading)
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader}></div>
        <p style={{ color: "#555" }}>Loading events...</p>
      </div>
    );

  return (
    <div style={styles.container}>
      <h4 style={styles.header}>
        COOL <span style={styles.highlight}>Event Activities</span>
      </h4>

      <div style={{ position: "relative" }}>
        {/* Left Arrow */}
        <button style={styles.arrowLeft} onClick={scrollLeft}>
          &#10094;
        </button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          style={{
            display: "flex",
            overflowX: "hidden",
            gap: "20px",
            paddingBottom: "10px",
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
                    minWidth: "300px",
                    flexShrink: 0,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                    transition: "all 0.6s ease",
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
                          (event.description.length > 100 && !isExpanded ? "..." : ""),
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
                  <div style={styles.footer}>
  <p style={styles.meta}>
    Date: {new Date(event.event_date).toLocaleDateString()} |{" "}
    {event.location || "N/A"} | {event.country || "N/A"}
  </p>
  <Link to={`/events/${event.id}`} style={styles.button}>
    View Details
  </Link>
</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: "center", color: "#666" }}>No events found.</p>
          )}
        </div>

        {/* Right Arrow */}
        <button style={styles.arrowRight} onClick={scrollRight}>
          &#10095;
        </button>
      </div>

      {events.length > 3 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/events" style={styles.viewAllButton}>
            View All Events
          </Link>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "10px", maxWidth: "100%", margin: "10px auto", fontFamily: "'Inter', sans-serif", },
  header: { textAlign: "center", fontSize: "1.5rem", fontWeight: "700", marginBottom: "20px", color: "#1a1a1a" },
  highlight: { background: "linear-gradient(90deg, #007bff, #00c6ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  card: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "10px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  mediaWrapper: { width: "100%", height: "200px", overflow: "hidden" },
  media: { width: "100%", height: "100%", objectFit: "contain", marginTop: "10px" },
  noMedia: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    color: "#999",
    background: "linear-gradient(135deg, #e9ecef, #dee2e6)",
  },
  media: { width: "100%", height: "100%", objectFit: "contain", marginTop: "10px" },
  noMedia: { display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#999", background: "linear-gradient(135deg, #e9ecef, #dee2e6)" },
  content: { padding: "15px", display: "flex", flexDirection: "column" },
  title: { fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" },
  description: { fontSize: "0.95rem", color: "#555", marginBottom: "10px", lineHeight: 1.4 },
  seeMoreButton: { background: "none", border: "none", color: "#2563eb", cursor: "pointer", padding: 0, marginBottom: "10px", alignSelf: "flex-start" },
  meta: { fontSize: "0.85rem", color: "#777", marginBottom: "12px" },
  button: { display: "inline-block", textDecoration: "none", background: "none", color: "#0d42f1ff", padding: "6px 12px", borderRadius: "6px", fontWeight: "500", alignSelf: "flex-start" },
  viewAllButton: { display: "inline-block", textDecoration: "none", background: "linear-gradient(90deg, #007bff, #00c6ff)", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontWeight: "500" },
  loaderContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh" },
  loader: { width: "40px", height: "40px", border: "4px solid #e0e0e0", borderTop: "4px solid #007bff", borderRadius: "50%", animation: "spin 1s linear infinite" },
  arrowLeft: { position: "absolute", top: "60%", left: "-30px", transform: "translateY(-50%)", background: "#f9f9f970", color: "#007bff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", zIndex: 10 },
  arrowRight: { position: "absolute", top: "60%", right: "-30px", transform: "translateY(-50%)", background: "#f9f9f9d9", color: "#007bff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", zIndex: 10 },
};

export default EventList;
