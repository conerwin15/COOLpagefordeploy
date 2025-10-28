import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Header from  "../headers/headerfornews"
const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState({});
  const API_URL = process.env.REACT_APP_API_URL;
  const cardsRef = useRef([]);

  // Convert URLs to clickable links
  const createLinkifiedText = (text) => {
    return text?.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb; text-decoration:underline;">$1</a>'
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

  // Scroll animation using IntersectionObserver
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

  if (loading) return <p>Loading events...</p>;
  if (events.length === 0) return <p>No events found.</p>;

  return (
    <><Header />
    <div style={styles.container}>
      <h2 style={styles.header}>All Event Activities</h2>
      <div style={styles.list}>
        {events.map((event, index) => {
          const isVisible = visibleCards[event.id] || false;
          const descriptionText = event.description.slice(0, 150) + (event.description.length > 150 ? "..." : "");

          return (
            <div
              key={event.id}
              data-id={event.id}
              ref={(el) => (cardsRef.current[index] = el)}
              style={{
                ...styles.card,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.6s ease",
              }}
            >
              {event.media && (
                <div style={styles.mediaWrapper}>
                  {event.media_type === "image" ? (
                    <img
                      src={event.media.startsWith("http") ? event.media : `${API_URL}/uploads/events/${event.media}`}
                      alt={event.event_name}
                      style={styles.media}
                    />
                  ) : (
                    <video
                      src={event.media.startsWith("http") ? event.media : `${API_URL}/uploads/events/${event.media}`}
                      controls
                      style={styles.media}
                    />
                  )}
                </div>
              )}

              <div style={styles.content}>
                <h3 style={styles.title}>{event.event_name}</h3>
                <p
                  style={styles.description}
                  dangerouslySetInnerHTML={{ __html: createLinkifiedText(descriptionText) }}
                />
                <p style={styles.meta}>
                 Date: {new Date(event.event_date).toLocaleDateString()} | Location {event.location || "N/A"} | {event.country || "N/A"}
                </p>
                <Link to={`/events/${event.id}`} style={styles.button}>
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div></>
  );
};

const styles = {
  container: { padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  header: { fontSize: "2rem", fontWeight: "700", marginBottom: "20px", textAlign: "center" },
  list: { display: "flex", flexDirection: "column", gap: "20px" },
  card: { display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.95)", borderRadius: "12px", boxShadow: "0 6px 15px rgba(0,0,0,0.1)", overflow: "hidden" },
  mediaWrapper: { width: "100%", height: "200px", overflow: "hidden" },
  media: { width: "100%", height: "100%", objectFit: "contain" },
  content: { padding: "15px", display: "flex", flexDirection: "column" },
  title: { fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" },
  description: { fontSize: "0.95rem", color: "#555", marginBottom: "10px", lineHeight: 1.4 },
  meta: { fontSize: "0.85rem", color: "#777", marginBottom: "12px" },
  button: { display: "inline-block", textDecoration: "none", background: "none", color: "#0d42f1ff", padding: "6px 12px", borderRadius: "6px", fontWeight: "500", alignSelf: "flex-start" },
};

export default AllEvents;
