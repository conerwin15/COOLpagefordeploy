import React, { useState } from "react";
import Reallybot from './Reallybot.png'; // Adjust path if needed

export default function Header() {
  return (
    <div className="header-container">
      <header className="header">
        {/* Logo */}
        <div className="logo">
          <img
            src={Reallybot}
            alt="Really Lesson Logo"
            style={{ height: "30px" }}
          />
        </div>

        {/* Contact Us 
        <div className="contact-us">
          <button
            onClick={() => window.location.href = "/contact"}
            style={buttonStyle}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            Contact Us
          </button>
        </div>*/}
      </header>

      {/* CSS */}
         <style jsx>{`
  .header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  width: 100%;
  padding: 8px 20px;

  /* ✅ Glassmorphism core */
  background: rgba(255, 255, 255, 0.15); /* transparent white layer */
  backdrop-filter: blur(12px) saturate(200%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);

  /* ✅ Optional subtle gradient overlay */
  background-image: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.15),
    rgba(173, 216, 230, 0.25)
  );

  /* ✅ Border + shadow for depth */
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  position: sticky;
  top: 0;
  z-index: 1000;
  border-radius: 0 0 12px 12px; /* optional soft curve bottom */
}

  .logo {
  display: flex;
  align-items: center;
  gap: 8px; /* optional space between icon and text */
}

.logo img {
  width: 90px;   /* ✅ change this to your preferred size */
  height: auto;  /* keeps aspect ratio */
}

.logo span {
  font-size: 30px; /* ✅ adjust logo text size if you have one */
  font-weight: bold;
}

  .desktop-menu {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .mobile-menu {
    display: none;
  }

  .mobile-dropdown {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: white;
    padding: 15px 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* 📱 Mobile Rules */
  @media (max-width: 768px) {
    .desktop-menu {
      display: none !important;
    }
    .mobile-menu {
      display: block !important;
    }
  }
`}</style>
    </div>
  );
}

// Reusable button style
const buttonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "3px",
  backgroundColor: "#0077b6",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "5px 15px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.3s ease",
};

// Hover effect helpers
function hoverIn(e) {
  e.currentTarget.style.backgroundColor = "#005f8a";
}

function hoverOut(e) {
  e.currentTarget.style.backgroundColor = "#0077b6";
}
