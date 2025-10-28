import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Newsheader from '../headers/headerfornews'
import Loading from "../icon/loading";
  const API_URL= process.env.REACT_APP_API_URL;
const NewsDetails = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const navigate = useNavigate();
 const [expandedContent, setExpandedContent] = useState({});
  useEffect(() => {
    fetch(`${API_URL}/get_news.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.news.length > 0) {
          setNewsItem(data.news[0]);
        } else {
          console.error("News not found");
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!newsItem) return <p style={{ textAlign: "center" }}><Loading /></p>;
const createLinkifiedText = (text) => {
  return text
    // Convert URLs to clickable links
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb">$1</a>'
    )
    // Convert hashtags to clickable links
    .replace(
      /(^|\s)(#[a-zA-Z0-9_]+)/g,
      '$1<a href="/hashtag/$2" style="color:#2563eb; text-decoration:none;">$2</a>'
    );
};
  return (
<>
    <Newsheader />
  <button className="back-btn" onClick={() => navigate("/")}>← Back to Home</button>

    <div className="news-details-container">
  

     <div className="news-card">
  {/* Title */}
  <h2 className="news-title">{newsItem.title || "News Detail"}</h2>

  {/* Category */}
  {newsItem.category && (
    <span className="news-category">{newsItem.category}</span>
  )}

  {/* Media */}
  <div className="news-media-container">
    {newsItem.media && newsItem.media.length > 0 &&
      newsItem.media.map((m, index) =>
        m.url.endsWith(".mp4") ? (
          <video
            key={index}
            src={m.url}
            controls
            className="news-media"
          />
        ) : (
          <img
            key={index}
            src={m.url}
            alt="news"
            className="news-media"
          />
        )
      )
    }
  </div>

  {/* Content */}



  <p
  style={{
    fontSize: "15px",
    color: "#374151",
    marginBottom: "8px",
    whiteSpace: "pre-wrap",
  }}
  dangerouslySetInnerHTML={{
    __html:
      expandedContent[newsItem.id] || newsItem.content.split(" ").length <= 1000
        ? createLinkifiedText(String(newsItem.content))
        : createLinkifiedText(
            String(newsItem.content).split(" ").slice(0, 50).join(" ") + "..."
          ),
  }}
></p>


  {/* Meta / Author */}
  <p className="news-meta">
    Posted last:{" "}
    {new Date(newsItem.created_at).toLocaleDateString()} ||  {newsItem.category && (
    <span className="news-category">{newsItem.category}</span>
  )}
  </p>
</div>
   <style jsx>{`
  /* ✅ Wrapper centered on all screen sizes */
  .news-details-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    min-height: 100vh;
    background: #f9f9f9;
    padding: 30px 15px;
    box-sizing: border-box;
    height: auto;
  }

  /* ✅ Centered content box with dynamic borders */
  .news-card {
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 900px;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  box-sizing: border-box;
  height: auto;

  /* ✅ Fixed: Only transition color/shadow — no position shift */
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}

  .back-btn {
    background-color: transparent;
    color: #79b8fa;
    border: 1px solid;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    margin-bottom: 30px;
    margin-top: 10px;
    transition: all 0.3s ease;
    align-self: flex-start;
  }

  .back-btn:hover {
    background-color: #005f8a;
    color: #fff;
  }

  .news-title {
    font-size: 28px;
    font-weight: 700;
    color: #0077b6;
    margin-bottom: 10px;
    text-align: center;
  }

  .news-media-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    align-items: center;
  }

  .news-media {
    width: 100%;
    height: auto;
    max-height: 500px;
    object-fit: cover;
    border-radius: 10px;
    display: block;
    background-color: #f2f2f2;
  }

  .news-content {
    font-size: 16px;
    color: #333;
    line-height: 1.6;
    text-align: justify;
  }

  .news-meta {
    font-size: 12px;
    color: #777;
    text-align: right;
  }

  @media (min-width: 1200px) {
    .news-card {
      max-width: 1000px;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
    }
  }

  @media (max-width: 992px) {
    .news-card {
      max-width: 95%;
      border-left: 1px solid #e0e0e0;
      border-right: 1px solid #e0e0e0;
    }

    .news-title {
      font-size: 24px;
    }
  }

  @media (max-width: 768px) {
    .news-details-container {
      padding: 15px;
    }

    .news-card {
      max-width: 100%;
      border: none;
      box-shadow: none;
      border-radius: 10px;
    }

    .news-title {
      font-size: 22px;
    }

    .news-content {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    .news-card {
      padding: 15px;
      border: none;
      border-radius: 8px;
    }

    .news-media {
      border-radius: 8px;
    }
  }
`}</style>


    </div> </>
  );
};

export default NewsDetails;
