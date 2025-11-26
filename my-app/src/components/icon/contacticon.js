// src/components/ContactIcon.js
import React from "react";
import { FaPhoneAlt } from "react-icons/fa"; // Using react-icons for contact icon

const ContactIcon = ({ onClick }) => {
  const styles = {
    container: {

   
      height: "50px",
      borderRadius: "50%",
      backgroundColor: "#0d42f1",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#fff",
      fontSize: "20px",
      cursor: "pointer",
    
      zIndex: 10000,
    },
  };

  return (
    <div style={styles.container} onClick={onClick}>
      <FaPhoneAlt />
    </div>
  );
};

export default ContactIcon;
