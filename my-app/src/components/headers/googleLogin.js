// MyGoogleLogin.js
import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import Gicon from "../icon/googleicon";

const API_URL = process.env.REACT_APP_API_URL;

const MyGoogleLogin = ({ onLogin }) => {
  // 🔹 Get actual country from IP (accurate)
  const getCountry = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      return data.country_name || "Singapore"; // fallback if no result
    } catch (err) {
      console.error("Country lookup failed:", err);
      return "Singapore"; // fallback default
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Google token:", tokenResponse);

        // Get Google user info
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const userInfo = await userInfoRes.json();
        console.log("Google user:", userInfo);

        // 🔹 Detect real country
        const country = await getCountry();
        console.log("Detected Country:", country);

        // Send all to backend
        const res = await fetch(`${API_URL}/google-login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            google_id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
            country: country,

            // 🔥 IMPORTANT → Tell backend this is Google registration
            via_google: "1",
          }).toString(),
        });

        const data = await res.json();

        if (data.success && data.user) {
          const user = data.user;

          // Save locally
          localStorage.setItem("forumUser", JSON.stringify(user));
          localStorage.setItem("userEmail", user.email);

          if (onLogin) onLogin(user);

          // Redirect based on role
          window.location.href = user.role === "admin" ? "/admin" : "/";
        } else {
          alert(data.message || "Google login failed");
        }
      } catch (err) {
        console.error("Google login failed:", err);
      }
    },

    // ✅ FIXED
    onError: () => console.log("Google login failed"),
  });

  return (
    <button
      onClick={() => login()}
      style={{
        backgroundColor: "transparent",
        color: "#0077b6",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
      }}
    >
      Register/Login with <Gicon />oogle
    </button>
  );
};

export default MyGoogleLogin;
