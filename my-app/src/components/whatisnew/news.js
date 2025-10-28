import React, { useState, useEffect, useCallback} from "react";
import "./CreatePost.css";

export default function CreatePost({ userId, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost/coolpage/my-app/backend";

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // Fetch news posts
 const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/get_news.php`);
      const data = await res.json();
      if (data.success) {
        setNews(data.news);
      }
    } catch (err) {
      console.error("Error fetching news:", err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchNews();

    // 🔁 Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchNews();
    }, 500);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, [fetchNews]);

  // Function to send notification
  const sendNotification = async (notifUserId, postTitle, postId) => {
    const formData = new FormData();
    formData.append("user_id", notifUserId);
    formData.append("message", `New ${category.toLowerCase()}: ${postTitle}`);
    formData.append("link", `http://localhost:3000/news/${postId}`);

    try {
      const res = await fetch(`${API_URL}/add_notification.php`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!result.success) {
        console.warn("Notification error:", result.message);
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  };

  // Handle post submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User ID is missing. Please log in first.");
      console.error("userId prop is undefined!");
      return;
    }

    if (!content && files.length === 0) {
      alert("Please add content or media.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    files.forEach((file) => formData.append("media[]", file));

    try {
      // 1️⃣ Create the post
      const res = await fetch(`${API_URL}/add_postnews.php`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        const postId = result.post.id;
        fetchNews();

        // 2️⃣ Send notification to the creator themselves (or all users)
        await sendNotification(userId, title, postId);

        alert("Post created and notification sent successfully!");
        fetchNews()
        setTitle("");
        setContent("");
        setFiles([]);
        setCategory("General");
        if (onClose) onClose();
      

        fetchNews();
      } else {
        alert(result.message || "Failed to create post.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while creating the post.");
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="modal">
    <div className="modal-content" onDragOver={(e) => e.preventDefault()}>
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>

      <h2 className="modal-title">News Post</h2>

      <input
        type="text"
        className="input-title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="input-textarea"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>

      <select
        className="input-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option>General</option>
        <option>Announcement</option>
        <option>Event</option>
      </select>

      {/* ✅ Upload box - single drag/drop zone */}
      <div
        className="upload-box"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFiles = Array.from(e.dataTransfer.files);

          // Prevent duplicates by file name + size
          setFiles((prev) => {
            const existing = new Set(prev.map((f) => f.name + f.size));
            const filtered = droppedFiles.filter(
              (f) => !existing.has(f.name + f.size)
            );
            return [...prev, ...filtered];
          });
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => {
              const existing = new Set(prev.map((f) => f.name + f.size));
              const filtered = newFiles.filter(
                (f) => !existing.has(f.name + f.size)
              );
              return [...prev, ...filtered];
            });
          }}
          style={{ display: "none" }}
          id="mediaInput"
        />
        <label htmlFor="mediaInput" className="click-text">
          Drag & drop photos/videos or click to add
        </label>

        {/* ✅ Preview section */}
        {files.length > 0 && (
          <div className="preview-container">
            {files.map((file, i) => (
              <div key={i} className="preview-item">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="preview-thumb"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    className="preview-thumb"
                    controls
                  />
                )}
                <button
                  className="remove-btn"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, index) => index !== i))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Buttons */}
      <div className="button-row">
        <button
          className="cancel-btn"
          onClick={() => {
            setFiles([]); // clear all selected files
            onClose();
          }}
        >
          Cancel
        </button>
        <button className="post-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  </div>
);

}
