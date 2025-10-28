import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSnowflake } from "@fortawesome/free-solid-svg-icons"; // You can change this icon if you prefer

const CoolActivitiesIcon = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        color: "#03010b",
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
      {/* COOL Activities Icon */}
      <FontAwesomeIcon
        icon={faSnowflake}
        style={{ color: "#0077b6", fontSize: "20px" }}
      />

    </div>
  );
};

export default CoolActivitiesIcon;
