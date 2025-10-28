import React from 'react';
import FounderCEO from './banners/MessageCEO'
import Whatlearnersay from "./banners/Testimonial"
import AboutUs  from './banners/Aboutus';

export default function About() {
  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '30px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f4f6f9',
      color: '#333',
    },
    bannerImage: {
      width: '100%',
      height: '300px',
      objectFit: 'cover',
      borderBottom: '4px solid #007bff',
      borderRadius: '4px',
    },
    heading: {
      textAlign: 'center',
      color: '#007bff',
      marginTop: '30px',
    },
    highlight: {
      fontWeight: 'bold',
      color: '#444',
    },
    italic: {
      fontStyle: 'italic',
    },
    paragraph: {
      lineHeight: '1.7',
      fontSize: '17px',
      marginTop: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <AboutUs />
<FounderCEO />
<Whatlearnersay />

    </div>
  );
}
