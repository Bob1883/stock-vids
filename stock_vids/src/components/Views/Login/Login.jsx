import React, { useState, useEffect, useRef } from "react";
import CheckBox from "../../Buttons/CheckBox/CheckBox";
import { Link } from "react-router-dom";

import Logo from "../../../images/logo.png";
import backgroundImage from "../../../images/background-image.png";
import InfoPopup from "../../models/InfoPopup/InfoPopup";
import Loading from "../Loading/Loading";

import "./LoginStyle.css";

const Login = ({ setIsLoggedIn, isLoggedIn }) => {
  const [infoPopupMessage, setInfoPopupMessage] = useState("");
  const [infoPopupTheme, setInfoPopupTheme] = useState("info");
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const email = document.querySelector(".login-form-email input").value;
    const password = document.querySelector(".login-form-password input").value;

    console.log("email", email);
    console.log("password", password);

    const handlePopup = () => {
      const popup = document.querySelector(".info-popup");
      popup.style.top = "3%";
      setTimeout(() => {
        popup.style.top = "-100%";
      }, 4000);
    };

    if (email === "" || password === "") {
      setInfoPopupMessage("Please fill in all fields");
      setInfoPopupTheme("warning");
      handlePopup();
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setInfoPopupMessage("Wrong information");
      setInfoPopupTheme("warning");
      handlePopup();
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setInfoPopupMessage("Wrong information");
      setInfoPopupTheme("warning");
      handlePopup();
      setIsLoading(false);
      return;
    }

    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      console.log("isLoggedIn", isLoggedIn);
      setTimeout(() => {
        window.location.href = "/home";
      }, 100);
    } else {
      setInfoPopupMessage("Invalid email or password");
      setInfoPopupTheme("warning");
      handlePopup();
      setIsLoading(false);
    }
  };

  return (
    <div>
      <InfoPopup
        trigger={showPopup}
        title={infoPopupTheme}
        description={infoPopupMessage}
        className="info-popup"
      />
      {isLoading ? (
        <Loading />
      ) : (
        <div className="login-container">
          <img
            src={backgroundImage}
            alt="background"
            className="login-background-image"
          />
          <div className="login-form">
            <img src={Logo} alt="logo" className="login-form-logo" />
            <div className="login-form-content">
              <h2>Welcome!</h2>
              <div className="login-form-inputs">
                <div className="login-form-email">
                  <p>Email</p>
                  <div>
                    <input
                      type="text"
                      className="input-container"
                      placeholder={"Enter your email"}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          document
                            .querySelector(".login-form-password input")
                            .focus();
                        }
                      }}
                      inputMode="email"
                    />
                  </div>
                </div>
                <div className="login-form-password">
                  <p>Password</p>
                  <div>
                    <input
                      type="password"
                      className="input-container"
                      placeholder={"Enter your password"}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleLogin();
                        }
                      }}
                      inputMode="text"
                    />
                  </div>
                </div>
                <div className="login-form-remember-me">
                  <CheckBox width={"23px"} height={"23px"} />
                  <p>Remember me</p>
                </div>
              </div>
              <div onClick={handleLogin} className="login-form-button">
                <div className="submit-button">Login</div>
              </div>
              <p className="login-form-signup">
                Not a member? <Link to="/register">Sign up now</Link>
              </p>
            </div>
            <p className="login-form-reset-password">
              <Link to="/reset-password">Forgot password?</Link>
            </p>
          </div>
          <div className="login-gradient"></div>
        </div>
      )}
    </div>
  );
};

export default Login;
