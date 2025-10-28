import React, { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Erwin Concepcion",
    role: "IT, COOL Community",
    country: "Philippines",
    photo: "	https://fms.techtreeglobal.com/assets/uploads/1761492000_Erwin.jpg",
    message:
      "COOL helped me connect with amazing mentors and learners across Asia. The platform truly inspires growth and collaboration!",
  },
  {
    name: "Maricar Villarba",
    role: "Country Manager",
    country: "Philippines",
    photo: "https://fms.techtreeglobal.com/assets/uploads/1761491940_Maricar.jpg",
    message:
      "I learned so much through COOL. The courses are engaging, and the community support is unmatched!",
  },
  {
    name: "Bea Tumaque",
    role: "Educator and Manager",
    country: "Philippines",
    photo: "	https://fms.techtreeglobal.com/assets/uploads/1761491940_BEa.jpg",
    message:
      "Teaching on COOL has been such a rewarding experience. The community is vibrant, creative, and always ready to learn.",
  },
];

const TestimonialCarousel = () => {
  const [current, setCurrent] = useState(0);

  // Auto slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () =>
    setCurrent((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () =>
    setCurrent((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );

  return (
    <section
      style={{
        padding: "60px 20px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4ebf5 100%)",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <h2
        style={{
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: "700",
          color: "#161718",
          marginBottom: "40px",
        }}
      >
         
      </h2>

          <h2
  style={{
    width: "100%",
    display: "block",
    margin: "20px auto",
        fontSize: "1.5rem",
    fontWeight: "800",
  }}
>
   What Our
  <span
    style={{
      background: "linear-gradient(90deg, #007bff, #00c6ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    {" "}Learners Say
  </span>
</h2>

      <div
        style={{
          position: "relative",
          maxWidth: "700px",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {testimonials.map((t, index) => (
          <div
            key={index}
            style={{
              opacity: index === current ? 1 : 0,
              transform:
                index === current
                  ? "translateX(0)"
                  : index > current
                  ? "translateX(100%)"
                  : "translateX(-100%)",
              transition: "all 0.8s ease-in-out",
              position: index === current ? "relative" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
            }}
          >
            {/* Diagonal Frame & Photo */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  width: "160px",
                  height: "180px",
                  background:
                    "linear-gradient(135deg, #8cbff7ff, #ffffffff, #fcfefeff)",
                  padding: "6px",
                  borderRadius: "14px",
                  transform: "rotate(-3deg)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  transition: "transform 0.5s ease",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "10px",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    boxShadow: "inset 0 0 10px rgba(0,0,0,0.15)",
                  }}
                >
                  <img
                    src={t.photo}
                    alt={t.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.8s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />
                </div>
              </div>
            </div>

            {/* Testimonial Text */}
            <blockquote
              style={{
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                color: "#333",
                fontStyle: "italic",
                lineHeight: "1.8",
                margin: "0 auto 20px",
                maxWidth: "600px",
              }}
            >
              “{t.message}”
            </blockquote>

            {/* Name, Role, Country */}
            <div style={{ marginTop: "15px" }}>
              <p
                style={{
                  fontWeight: "600",
                  color: "#007bff",
                  marginBottom: "5px",
                  fontSize: "1rem",
                }}
              >
                — {t.name}
              </p>
              <p
                style={{
                  color: "#666",
                  fontSize: "0.9rem",
                  marginBottom: "3px",
                }}
              >
                {t.role}
              </p>
              <p
                style={{
                  color: "#999",
                  fontSize: "0.85rem",
                  letterSpacing: "0.3px",
                }}
              >
                {t.country}
              </p>
            </div>
          </div>
        ))}

        {/* Navigation buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <button onClick={prevSlide} style={navButtonStyle}>
            ❮
          </button>
          <button onClick={nextSlide} style={navButtonStyle}>
            ❯
          </button>
        </div>
      </div>
    </section>
  );
};

// Shared button styles
const navButtonStyle = {
  background: "linear-gradient(135deg, #00eeffff, #dbd2eaff)",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  fontSize: "20px",
  cursor: "pointer",
  transition: "background 0.3s ease, transform 0.2s ease",
};

export default TestimonialCarousel;
