import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

export default function BannerUploadPopup() {
  const [showBanner, setShowBanner] = useState(true); // popup visible initially
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a banner image!");

    const formData = new FormData();
    formData.append("banner", file);

    try {
      const res = await fetch(`${API_URL}/add_banner.php`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("Banner uploaded successfully!");
        handleClose();
      } else {
        alert("Upload failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  const handleClose = () => {
    setShowBanner(false);
    setFile(null);
    setPreview(null);
  };

  if (!showBanner) return null; // hide the popup

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
      onClick={handleClose} // close on backdrop click
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "500px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        <h2>Upload Banner</h2>
        <form
          onSubmit={handleUpload}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input type="file" accept="image/*" onChange={handleFileChange} />

          {/* Image preview */}
          {preview && (
            <div style={{ textAlign: "center" }}>
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: "100%", borderRadius: "6px", marginTop: "10px" }}
              />
              <button
                type="button"
                onClick={() => setFile(null) || setPreview(null)}
                style={{
                  marginTop: "5px",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel Photo
              </button>
            </div>
          )}

          <button
            type="submit"
            style={{
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}
