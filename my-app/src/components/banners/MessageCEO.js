import React, { useEffect, useRef, useState } from "react";

const MessageFromFounder = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // ✅ Fade-in animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setVisible(entry.isIntersecting)),
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        background: "linear-gradient(135deg, #f7f9fc 0%, #eef3f9 100%)",
        transition: "opacity 1s ease, transform 1s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(50px)",
      }}
    >
    


        <h2
  style={{
    width: "100%",
    display: "block",
    textAlign: "center",
    margin: "10px auto",
        fontSize: "1.5rem",
    fontWeight: "800",
  }}
>
   Welcome and
  <span
    style={{
      background: "linear-gradient(90deg, #007bff, #00c6ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    {" "}Opening Message by Mike
  </span>
</h2>


      {/* ✅ Diagonal Card Frame with image on left */}
      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: "20px",
          padding: "40px 30px",
          maxWidth: "900px",
                  gap: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          transform: "rotate(-1.5deg)",
          transition: "transform 0.5s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "rotate(0deg) scale(1.02)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "rotate(-1.5deg) scale(1)")
        }
      >
        {/* Decorative gradient border */}
        <div
          style={{
            position: "absolute",
            top: "-10px",
            left: "-10px",
            right: "-10px",
            bottom: "-10px",
            borderRadius: "25px",
            background:
              "linear-gradient(135deg, rgba(0,123,255,0.2), rgba(102,16,242,0.1))",
            zIndex: -1,
            transform: "rotate(2deg)",
          }}
        ></div>

        {/* ✅ Content Layout: Image Left, Message Right */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* 🖼 Founder Photo Frame (Left Side) */}
          <div
            style={{
              flex: "0 0 auto",
              width: "180px",
              height: "220px",
              background: "linear-gradient(135deg, #d4af37, #f9f9f9, #b8860b)",
              padding: "6px",
              borderRadius: "12px",
              
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              position: "relative",
              transition: "transform 0.4s ease, box-shadow 0.4s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 12px 30px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(0,0,0,0.15)";
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#fff",
                borderRadius: "8px",
                padding: "5px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: "6px",
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src="		https://fms.techtreeglobal.com/assets/uploads/1761491100_Sir Michael.png"
                  alt="Founder"
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

          {/* 📝 Founder Message (Right Side) */}
          <div style={{ flex: 1, minWidth: "250px" }}>
            <blockquote
              style={{
                fontStyle: "italic",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                color: "#333",
                lineHeight: "1.8",
                textAlign: "left",
                margin: 0,
              }}
            >
              “My vision for COOL is to create a dynamic learning ecosystem that
              inspires collaboration, innovation, and continuous growth. COOL
              plays a vital role in connecting people across the globe, enabling
              them to share ideas, learn from one another, and develop new
              skills for the future. Ultimately, we aim to build an innovative
              culture of curiosity and lifelong learning—one where everyone
              feels empowered to grow both personally and professionally, in
              alignment with our vision to Educate Asia.”
            </blockquote>

            <p
              style={{
                marginTop: "20px",
                textAlign: "left",
                fontWeight: "600",
                color: "#007bff",
                fontSize: "1rem",
              }}
            >
              — Dr. Michael Choy, CEO and Founder of Tech Tree Global
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessageFromFounder;
