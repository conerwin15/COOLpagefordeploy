import React, { useEffect, useRef, useState } from "react";

const AboutUs = () => {
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
        flexDirection: window.innerWidth <= 768 ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        gap: "50px",
        maxWidth: "1200px",
        margin: "0 auto",
    
        transform: visible ? "translateY(0)" : "translateY(40px)",
        opacity: visible ? 1 : 0,
        transition: "all 1s ease",
      }}
    >
      {/* ✅ Overlapping Circular Images */}
      <div
        style={{
          position: "relative",
          width: "300px",
          height: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Large Circle (Behind) */}
        <div
          style={{
            position: "absolute",
            width: "230px",
            height: "230px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
            border: "3px solid #f6f7f9",
            zIndex: 1, // 👈 behind
            transform: "translate(-40px, 0px)",
          }}
        >
          <img
            src="https://fms.techtreeglobal.com/assets/uploads/1761477300_coolabout3.jpg"
            alt="Main About Image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.8s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>

  {/* Small Circle (Forward) */}
        <div
          style={{
            position: "absolute",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            border: "3px solid #f6f7f9",
            transform: "translate(-120px, -100px)", // 👇 placed at bottom right
            zIndex: 3, // 👈 forward
         
          }}
        >
            	
          <img
            src="	https://fms.techtreeglobal.com/assets/uploads/1761477840_COOlabout4.jpg"
            alt="Community"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.8s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>

        

        {/* Small Circle (Forward) */}
        <div
          style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            border: "px solid #f6f7f9",
            transform: "translate(60px, 120px)", // 👇 placed at bottom right
            zIndex: 3, // 👈 forward
          }}
        >
            	
          <img
            src="https://fms.techtreeglobal.com/assets/uploads/1761477060_coolabout2.jpg"
            alt="Community"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.8s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      </div>

      {/* ✅ Text Section */}
      <div
        style={{
          flex: 1,
          textAlign: window.innerWidth <= 768 ? "center" : "left",
          padding: "10px",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.5rem, 3vw, 1rem)",
            fontWeight: "700",
            color: "#161718",
            marginBottom: "15px",
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
   ABOUT COOL,
  <span
    style={{
      background: "linear-gradient(90deg, #007bff, #00c6ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    {" "}OUR COMMUNITY OF ONLINE LEARNERS
  </span>
</h2>

        <p
          style={{
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            color: "#444",
            lineHeight: "1.7",
            marginBottom: "15px",
          }}
        >
          COOL (Community of Online Learners) is a global network of learners,
          educators, and innovators who connect, share, and grow together. We
          believe in learning without borders.
        </p>

        <p
          style={{
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            color: "#555",
            lineHeight: "1.7",
          }}
        >
          Our mission is to create a vibrant ecosystem that empowers individuals
          to learn collaboratively, embrace creativity, and build meaningful
          impact across the world.
        </p>
      </div>
    </section>
  );
};

export default AboutUs;
