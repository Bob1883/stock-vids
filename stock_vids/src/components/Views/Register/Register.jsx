import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../../images/logo.png";
import backgroundImage from "../../../images/background-image.png";
import InfoPopup from "../../models/InfoPopup/InfoPopup";
import "./RegisterStyle.css";

const Register = ({ setIsLoggedIn }) => {
  const [infoPopupMessage, setInfoPopupMessage] = useState("");
  const [infoPopupTheme, setInfoPopupTheme] = useState("info");
  const [showPopup, setShowPopup] = useState(false);

  const handlePopup = () => {
    const popup = document.querySelector(".info-popup");
    popup.style.top = "3%";
    setTimeout(() => {
      popup.style.top = "-100%";
    }, 4000);
  };

  const handleRegister = async () => {
    const email = document.querySelector(".register-form-email input").value;
    const password = document.querySelector(".register-form-password input").value;
    const reenterPassword = document.querySelector(".reeneter-password input").value;

    console.log("email", email);
    console.log("password", password);

    if (email === "" || password === "") {
      setInfoPopupMessage("Please fill in all fields");
      setInfoPopupTheme("warning");
      handlePopup();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setInfoPopupMessage("Invalid email format");
      setInfoPopupTheme("warning");
      handlePopup();
      return;
    }

    if (password.length < 8) {
      setInfoPopupMessage("Password must be at least 8 characters long");
      setInfoPopupTheme("warning");
      handlePopup();
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setInfoPopupMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      setInfoPopupTheme("warning");
      handlePopup();
      return;
    }

    if (password !== reenterPassword) {
      setInfoPopupMessage("Passwords do not match");
      setInfoPopupTheme("warning");
      handlePopup();
      return;
    }

    const response = await fetch("/register", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
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
        setTimeout(() => {
          window.location.href = "/home";
        }, 1000);
        } else {
        setInfoPopupMessage("Invalid email or password");
        setInfoPopupTheme("warning");
        handlePopup();
        }
    } else {
      setInfoPopupMessage("Registration failed");
      setInfoPopupTheme("warning");
      handlePopup();
    }
    };

  return (
    <div className="register-container">
      <InfoPopup
        trigger={showPopup}
        title={infoPopupTheme}
        description={infoPopupMessage}
        className="info-popup"
      />
      <img
        src={backgroundImage}
        alt="background"
        className="register-background-image"
      />
      <div className="register-form">
        <img src={Logo} alt="logo" className="register-form-logo" />
        <div className="register-form-content">
          <h2>
            Register
          </h2>
          <div className="register-form-inputs">
            <div className="register-form-email">
              <p>Email</p>
                <input
                  type="text"
                  className="input-container"
                  placeholder={"Enter your email"}
                />
            </div>
            <div className="register-form-password">
              <p>Password</p>
              <input
                  type="password"
                  className="input-container"
                  placeholder={"Enter your password"}
                />
            </div>
            <div className="reeneter-password">
                <p>Re-enter Password</p>
                <input
                  type="password"
                  className="input-container"
                  placeholder={"Re-enter your password"}
                />
            </div>
          </div>
          <div className="submit-button" onClick={handleRegister}>
            Register
          </div>
          <p className="register-form-register">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
      <div className="register-gradient">
      </div>
    </div>
  );
};

export default Register;
