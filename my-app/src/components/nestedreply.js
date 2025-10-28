import React, { useState } from "react";

import { createLinkifiedText, getMimeType, isImage, isVideo } from "./utils"; // helper functions if you already have them
import LikeButtons from './icon/LikeButton';
import ReplyButton from './icon/replybutton';
import UnLikeButtons from './icon/unlikebutton';
import DeleteButtons from './icon/deleteicon'; 
import ShareButton from './icon/shareicome';
const NestedReplies = ({
  replies = [],
  user,
  handleNestedReplySubmit,
  handleDeleteReply,
  handleLike,
  userLiked,
  likes,
}) => {
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [nestedReplyText, setNestedReplyText] = useState({});
  const [nestedReplyMedia, setNestedReplyMedia] = useState({});
  const [expandedContent, setExpandedContent] = useState({});
  const [showNestedReplies, setShowNestedReplies] = useState({});

  const renderReplies = (replyList, depth = 0) => {
    return replyList.map((reply) => (
      <div
        key={reply.id}
        style={{
          display: "flex",
          gap: "10px",
          marginLeft: depth > 0 ? `${depth * 40}px` : "0",
          marginTop: "10px",
          borderLeft: depth > 0 ? "2px solid #eee" : "none",
          paddingLeft: depth > 0 ? "10px" : "0",
        }}
      >
        {/* Avatar */}
        <img
          src={reply.profile_picture || "/default-avatar.png"}
          alt="avatar"
          style={{ width: "35px", height: "35px", borderRadius: "50%" }}
        />

        {/* Content */}
        <div style={{ flex: 1 }}>
          <strong>
            {reply.first_name} {reply.last_name}
          </strong>
          <span
            style={{
              fontSize: "12px",
              color: "#777",
              marginLeft: "6px",
            }}
          >
            {reply.time}
          </span>

          {/* Text with See more / less */}
          <p
            style={{
              fontSize: "15px",
              color: "#374151",
              marginBottom: "8px",
              whiteSpace: "pre-wrap",
            }}
            dangerouslySetInnerHTML={{
              __html: createLinkifiedText(
                expandedContent[reply.id]
                  ? String(reply.text)
                  : String(reply.text)
                      .split(" ")
                      .slice(0, 50)
                      .join(" ") +
                    (reply.text.split(" ").length > 50 ? "..." : "")
              ),
            }}
          ></p>

          {reply.text.split(" ").length > 50 && (
            <button
              onClick={() =>
                setExpandedContent((prev) => ({
                  ...prev,
                  [reply.id]: !prev[reply.id],
                }))
              }
              style={{
                fontSize: "13px",
                color: "#0077b6",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {expandedContent[reply.id] ? "See less" : "See more"}
            </button>
          )}

          {/* Media display */}
          {Array.isArray(reply.media) &&
            reply.media.map((item, idx) => {
              const isImg = isImage(item.url);
              const isVid = isVideo(item.url);
              return isImg ? (
                <img
                  key={idx}
                  src={item.url}
                  alt="reply media"
                  style={{
                    maxWidth: "25%",
                    margin: "5px 0",
                    borderRadius: "4px",
                    objectFit: "contain",
                  }}
                />
              ) : isVid ? (
                <video
                  key={idx}
                  controls
                  playsInline
                  style={{
                    maxWidth: "25%",
                    margin: "5px 0",
                    borderRadius: "4px",
                    objectFit: "contain",
                  }}
                >
                  <source src={item.url} type={getMimeType(item.url)} />
                </video>
              ) : null;
            })}

          {/* Like / Delete / Reply Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <button
              onClick={() => handleLike(reply.id, "reply")}
              style={{
                fontSize: "12px",
                color: userLiked[`reply_${reply.id}`] ? "#0077b6" : "#555",
                fontWeight: "bold",
                background: "transparent",
                border: "none",
                padding: "4px 8px",
                borderRadius: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {userLiked[`reply_${reply.id}`] ? (
                <LikeButtons />
              ) : (
                <UnLikeButtons />
              )}
              <span style={{ color: "#666" }}>
                {likes[`reply_${reply.id}`] || 0}
              </span>
            </button>

            {/* Reply button */}
            <button
              onClick={() =>
                setActiveReplyBox((prev) =>
                  prev === reply.id ? null : reply.id
                )
              }
              style={{
                fontSize: "13px",
                color: "#0077b6",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reply
            </button>

            {/* Delete */}
            {user &&
              (user.id === reply.user_id || user.role === "admin") && (
                <button
                  onClick={() => handleDeleteReply(reply.id)}
                  style={{
                    background: "none",
                    color: "#d9534f",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <DeleteButtons />
                </button>
              )}
          </div>

          {/* Reply box */}
          {activeReplyBox === reply.id && (
            <div style={{ marginTop: "8px" }}>
              <textarea
                rows="2"
                placeholder="Write a reply..."
                value={nestedReplyText[reply.id] || ""}
                onChange={(e) =>
                  setNestedReplyText((prev) => ({
                    ...prev,
                    [reply.id]: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  padding: "6px",
                  fontSize: "13px",
                }}
              />
              <button
                onClick={() =>
                  handleNestedReplySubmit(reply.post_id, reply.id)
                }
                style={{
                  marginTop: "6px",
                  padding: "6px 12px",
                  background: "#0077b6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          )}

          {/* Recursive nested replies */}
          {reply.children && reply.children.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              {renderReplies(reply.children, depth + 1)}
            </div>
          )}
        </div>
      </div>
    ));
  };

  return <div>{renderReplies(replies)}</div>;
};

export default NestedReplies;
