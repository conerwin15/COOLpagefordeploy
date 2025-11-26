// src/components/ViewDetailsIcon.js
import React from "react";
import { FaEye } from "react-icons/fa"; // Eye icon for view details

const ViewDetailsIcon = ({ onClick }) => {
  const styles = {
    container: {
      height: "50px",
      width: "50px",
      borderRadius: "50%",
      backgroundColor: "none",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#7e78f1ff",
      fontSize: "20px",
      cursor: "pointer",
      zIndex: 10000,

      transition: "transform 0.2s",
    },
  };

  return (
    <div
      style={styles.container}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      title="View Details"
    >
      <FaEye />
    </div>
  );
};

export default ViewDetailsIcon;
