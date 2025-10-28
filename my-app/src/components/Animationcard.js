import React, { useEffect, useRef, useState } from "react";

export default function Interactivecards({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        padding: "20px",
        marginBottom: "10px",
        backgroundColor: "#ffffff",
        boxShadow: isVisible
          ? "0 8px 24px rgba(0, 0, 0, 0.08)"
          : "0 4px 12px rgba(0, 0, 0, 0.04)",
        borderTop: "1px solid #eaeaea",
        borderBottom: "1px solid #eaeaea",
        borderLeft:
          window.innerWidth <= 768 ? "none" : "1px solid #eaeaea",
        borderRight:
          window.innerWidth <= 768 ? "none" : "1px solid #eaeaea",
        transition: "all 0.4s ease",
        width: window.innerWidth <= 768 ? "100vw" : "auto",
        marginLeft: window.innerWidth <= 768 ? "-10px" : "0",
        marginRight: window.innerWidth <= 768 ? "-10px" : "0",
        borderRadius: "10px",
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        opacity: isVisible ? 1 : 0,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow =
          "0 10px 25px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow =
          "0 8px 24px rgba(0, 0, 0, 0.08)";
      }}
    >
      {children}
    </div>
  );
}
