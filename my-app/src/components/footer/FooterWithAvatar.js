import React, { useEffect } from "react";

export default function FooterAvatar() {
  useEffect(() => {
    // === Avatar Widget Script ===
    (function () {
      const options = Object.assign(
        {
          avatarTitle: "Click to chat with Assistant Stanley",
          labelText: "Assistant Stanley",
          iframeSrc:
            "https://reallyavatar.com:5173/asst_JnTntrECDe2kqSwKuhtgueK3/Joey/pat/x",
          iframeTitle: "Assistant Stanley",
          iframeLabel: "Hello, I'm Stanley. How can I help you today?",
          avatarGif:
            "https://fms.techtreeglobal.com/assets/uploads/1758447540_BlinksRAV.gif",
          avatarSize: "70px",
        },
        window.avatarWidgetOptions || {}
      );

      const container = document.createElement("div");
      container.id = "avatar-container";
      Object.assign(container.style, {
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: "1000",
      });

      const avatar = document.createElement("div");
      avatar.title = options.avatarTitle;
      Object.assign(avatar.style, {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        overflow: "hidden",
        cursor: "pointer",
        border: "2px solid rgb(22, 131, 225)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 6px",
        backgroundColor: "#fff",
        padding: "0",
      });

      const gifImg = document.createElement("img");
      gifImg.src = options.avatarGif;
      Object.assign(gifImg.style, {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        backgroundColor: "transparent",
      });
      avatar.appendChild(gifImg);

      const iframeWrapper = document.createElement("div");
      Object.assign(iframeWrapper.style, {
        position: "relative",
        width: "340px",
        display: "none",
        marginTop: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "transparent",
      });

      const iframeLabel = document.createElement("div");
      Object.assign(iframeLabel.style, {
        backgroundColor: "rgb(22, 131, 225)",
        color: "white",
        padding: "8px 12px",
        fontSize: "14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      });

      const labelText = document.createElement("span");
      labelText.innerText = options.iframeLabel;

      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "✖";
      Object.assign(closeBtn.style, {
        background: "transparent",
        color: "Red",
        border: "none",
        fontSize: "16px",
        cursor: "pointer",
      });

      iframeLabel.appendChild(labelText);
      iframeLabel.appendChild(closeBtn);

      const iframe = document.createElement("iframe");
      iframe.src = options.iframeSrc;
      iframe.title = options.iframeTitle;
      iframe.allow = "camera; microphone; fullscreen";
      Object.assign(iframe.style, {
        width: "100%",
        height: "400px",
        border: "none",
        display: "block",
        backgroundColor: "transparent",
      });

      iframeWrapper.appendChild(iframeLabel);
      iframeWrapper.appendChild(iframe);

      container.appendChild(avatar);
      container.appendChild(iframeWrapper);
      document.body.appendChild(container);

      avatar.addEventListener("click", function () {
        iframeWrapper.style.display = "block";
        avatar.style.display = "none";
      });

      closeBtn.addEventListener("click", function () {
        iframeWrapper.style.display = "none";
        avatar.style.display = "flex";
      });
    })();
  }, []);

  return (
    <>
      <style>{`
        * {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .footer {
          background-color: #060d58;
          padding: 70px 0 0 70px;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
        }

        .container {
          max-width: 100%;
          margin: 0 30px 0 1px;
          font-size: 13px;
        }

        .grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          width: 100%;
          color: white;
          font-size: 13px;
        }

        .col {
          flex: 0 0 10%;
          max-width: 100%;
          margin-bottom: 30px;
        }

        #footerheader {
          margin-bottom: 5px;
          color: white;
          font-weight: 300;
          font-size: 18px;
        }

        a {
          color: white;
          text-decoration: none;
          font-weight: 400;
          font-size: 13px;
          transition: color 0.3s;
        }

        a:hover {
          color: #d1d1d1;
          text-decoration: underline;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 1px;
          color: white;
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .col {
            flex: 0 0 100%;
            max-width: 100%;
          }
        }

        .contact-info div {
          margin-top: 5px;
        }

        .flex {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .copyright {
          margin-top: 1px;
          text-align: center;
          width: auto;
        }
      `}</style>

      <footer className="footer">
        <div className="container">
          <div className="grid">
            <div className="col">
              <div className="logo">
                <img
                  src="/Logo/Reallybot.png"
                  alt="Logo"
                  style={{ width: "220px", height: "70px" }}
                />
              </div>
              <div className="contact-info">
                <div className="flex">
                  <i className="fas fa-phone" style={{ color: "white" }}></i>
                  <a href="tel:+6588494824">+65 8849 4824</a>
                </div>
                <div>(Text and WhatsApp messages only)</div>
                <div className="flex" style={{ marginTop: "5px" }}>
                  <i
                    className="fas fa-envelope"
                    style={{ color: "lightblue" }}
                  ></i>
                  <a href="mailto:jo@reallylesson.com">jo@reallylesson.com</a>
                </div>
              </div>
            </div>

            <div className="col" style={{ fontSize: "13px" }}>
              <h3 id="footerheader">Company</h3>
              <a href="https://techtreeglobal.com" target="_blank">
                Our Story
              </a>
              <br />
              <a href="https://techtreeglobal.com/what-we-do" target="_blank">
                What We Do
              </a>
              <br />
              <a href="/values">Our Values</a>
            </div>

            <div className="col">
              <h3 id="footerheader">Get Involved</h3>
              <a href="https://techtreeglobal.com/reallybots" target="_blank">
                ReallyBots
              </a>
              <br />
              <a
                href="https://techtreeglobal.com/how-are-we-different"
                target="_blank"
              >
                Our Strengths
              </a>
              <br />
            </div>

            <div className="col">
              <h3 id="footerheader">Resources</h3>
              <a href="https://techtreeglobal.blogspot.com" target="_blank">
                Blogs
              </a>
              <br />
              <a href="https://techtreeglobal.com/what-clients-say" target="_blank">
                Our Partners
              </a>
              <br />
              <a href="https://techtreeglobal.com/articles" target="_blank">
                Articles
              </a>
            </div>
          </div>

          <div className="copyright">
            <span>
              Copyright © TechTree All rights reserved COOL page v1.0.0
            </span>
            <br />
          </div>

          <hr />

          <div className="footer-links">
            <a href="https://reallylesson.com/accessibility">
              Accessibility Statement
            </a>
            <a href="https://reallylesson.com/site-policy">Site Policy</a>
            <a href="https://reallylesson.com/privacy">Privacy Notice</a>
            <a href="https://reallylesson.com/terms">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
