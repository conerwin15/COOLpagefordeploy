import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../headers/headerfornews";


const EventDetails = () => {
  const { id } = useParams(); // event ID from URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  // Convert URLs to clickable links
  const createLinkifiedText = (text) => {
    return text?.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb; text-decoration:underline;">$1</a>'
    );
  };

  useEffect(() => {
    // Fetch all events and filter by ID on frontend
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

  if (loading) return <p>Loading event details...</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <>
    <Header/>
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
   

      {event.media && (
        <div style={{ marginBottom: "20px" }}>
          {event.media_type === "image" ? (
            <img
              src={event.media.startsWith("http") ? event.media : `${API_URL}/uploads/events/${event.media}`}
              alt={event.event_name}
              style={{ width: "100%", maxHeight: "400px", objectFit: "contain", borderRadius: "12px" }}
            />
          ) : (
            <video
              src={event.media.startsWith("http") ? event.media : `${API_URL}/uploads/events/${event.media}`}
              controls
              style={{ width: "100%", maxHeight: "400px", borderRadius: "12px" }}
            />
          )}
        </div>
      )}
   <h4 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "10px" }}>
        {event.event_name}
      </h4>
      <p
        style={{ whiteSpace: "pre-wrap", fontSize: "1rem", color: "#555", marginBottom: "15px" }}
        dangerouslySetInnerHTML={{ __html: createLinkifiedText(event.description) }}
      />

      <p style={{ fontSize: "0.9rem", color: "#777", marginBottom: "20px" }}>
      Date: {new Date(event.event_date).toLocaleDateString()} | Location: {event.location || "N/A"} | {event.country || "N/A"}
      </p>

      <Link
        to="/"
        style={{
          display: "inline-block",
          textDecoration: "none",
          background: "linear-gradient(90deg, #007bff, #00c6ff)",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "8px",
          fontWeight: "500",
        }}
      >
        Back 
      </Link>
    </div></>
  );
};

export default EventDetails;
