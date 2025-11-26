import React, { useEffect, useRef, useState } from "react";

const JoinUs = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
const isMobile = window.innerWidth <= 480; // adjust breakpoint if needed
  // Fade-in animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setVisible(entry.isIntersecting)),
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    message: "",
  });

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/contact_submit.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        alert("Thank you! We’ll get back to you soon.");
        setFormData({ name: "", email: "", contact: "", message: "" });
        setShowContactModal(false);
          setShowForm(false); // ✅ fixed
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again later.");
    }
  };






  return (
    <section
      ref={sectionRef}
      style={{
        display: "flex",
        flexDirection: window.innerWidth <= 768 ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
    gap: isMobile ? "50px" : "100px", // 50px on mobile, 100px on desktop
        maxWidth: "900px",
        margin: "0 auto",
    
        transform: visible ? "translateY(0)" : "translateY(40px)",
        opacity: visible ? 1 : 0,
        transition: "all 1s ease",
      }}
    >
      {/* Triangular Circular Images */}
      <div
        style={{
          position: "relative",
          width: "300px",
          height: "300px",
          
        }}
      >
        {/* Top Circle */}
        <div
          style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            border: "3px solid #f6f7f9",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
          }}
        >
          <img
            src="https://fms.techtreeglobal.com/assets/uploads/1761707160_malayesiaCoOL.jpg"
            alt="Top"
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.8s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>

        {/* Bottom Left Circle */}
        <div
          style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            border: "3px solid #f6f7f9",
            bottom: 0,
            left: 0,
            transform: "translate(-30px, -10px)",
            zIndex: 2,
          }}
        >
          <img
            src="https://fms.techtreeglobal.com/assets/uploads/1761707220_WhatsApp Image 2025-10-09 at 22.20.22_d873f48f.jpg"
            alt="Bottom Left"
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.8s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>

        {/* Bottom Right Circle */}
        <div
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            border: "3px solid #f6f7f9",
            bottom: 0,
            right: 0,
            transform: "translate(40px, 50px)",
            zIndex: 2,
          }}
        >
          <img
            src="https://fms.techtreeglobal.com/assets/uploads/1761708060_samplw1.jpg"
            alt="Bottom Right"
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.8s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      </div>

      {/* Text + Button */}
      <div
        style={{
          flex: 1,
          textAlign: window.innerWidth <= 768 ? "center" : "left",
          padding: "10px",
            marginTop: "15px"
        }}
       
      >
            <h2
  style={{
    width: "100%",
    display: "block",
    margin: "20px auto",
        fontSize: "1.5rem",
    fontWeight: "800",
  }}
>
   JOIN
  <span
    style={{
      background: "linear-gradient(90deg, #007bff, #00c6ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    {" "}US
  </span>
</h2>
        <p style={{ fontSize: "1rem", color: "#444", marginBottom: "20px", lineHeight: 1.6 }}>
          Be part of our global community of learners, educators, and innovators. Connect, collaborate, and grow with us.
        </p>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "#0d42f1",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "1rem",
          }}
        >
          Contact Us
        </button>
      </div>

      {/* Modal Form */}
        {showForm && (
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
              />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitButton}>Submit</button>
              <button
  type="button"
  onClick={() => setShowForm(false)} // ✅ fixed
  style={styles.cancelButton}
>
  Cancel
</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};


const styles = {
  container: { padding: "20px", fontFamily: "'Inter', sans-serif", maxWidth: "1200px", margin: "0 auto" },
  header: { textAlign: "center", fontSize: "2rem", fontWeight: "700", marginBottom: "30px", color: "#1a1a1a" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    justifyItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s",
  },
  image: { width: "100%", height: "180px", objectFit: "cover" },
  content: { padding: "15px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  title: { fontSize: "1.3rem", fontWeight: "700", margin: 0 },
  subtitle: { fontSize: "1rem", color: "#555", margin: 0 },
  contactButton: {
    background: "#0d42f1",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
    transition: "background 0.3s",
  },
  contactButtonHover: { background: "#2563eb" },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    background: "none",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 1000,
    padding: "10px",
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
  },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", border: "1px solid #ccc", borderRadius: "6px" },
  textarea: { padding: "10px", border: "1px solid #ccc", borderRadius: "6px", minHeight: "80px" },
  modalButtons: { display: "flex", justifyContent: "space-between" },
  submitButton: { background: "#0d42f1", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
  cancelButton: { background: "#ccc", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
};

export default JoinUs;
