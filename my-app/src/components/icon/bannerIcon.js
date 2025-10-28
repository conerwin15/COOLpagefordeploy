import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleAd } from "@fortawesome/free-solid-svg-icons";

const bannerIcon = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        color: "#03010bff",
        fontSize: "18px",
        padding: "6px 10px",
        borderRadius: "8px",
        userSelect: "none",
        transition: "background 0.2s ease",
        marginBottom: "10px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Banner Icon */}
      <FontAwesomeIcon
        icon={faRectangleAd}
        style={{ color: "#0077b6", fontSize: "20px" }}
      />

   
    </div>
  );
};

export default bannerIcon;
