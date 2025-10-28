// utils.js

// ✅ Check if a file URL is an image
export const isImage = (url) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
};

// ✅ Check if a file URL is a video
export const isVideo = (url) => {
  if (!url) return false;
  return /\.(mp4|mov|avi|webm|mkv|ogg)$/i.test(url);
};

// ✅ Get MIME type based on file extension
export const getMimeType = (url) => {
  if (!url) return "";
  const ext = url.split(".").pop().toLowerCase();
  const mimeTypes = {
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    mkv: "video/x-matroska",
    avi: "video/x-msvideo",
    ogg: "video/ogg",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

// ✅ Convert plain text URLs into clickable links
export const createLinkifiedText = (text) => {
  if (!text) return "";
  // Convert URLs into <a> tags (opens in new tab)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0077b6;">${url}</a>`
  );
};
