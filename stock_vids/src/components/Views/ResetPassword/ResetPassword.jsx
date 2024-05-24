import React, { useState } from "react";
import { Link } from "react-router-dom";

import Logo from "../../../images/logo.png";
import InfoPopup from "../../models/InfoPopup/InfoPopup";
import Loading from "../Loading/Loading";

import "./ResetPasswordStyle.css";

const ResetPassword = () => {
  const [infoPopupMessage, setInfoPopupMessage] = useState("");
  const [infoPopupTheme, setInfoPopupTheme] = useState("info");
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    setIsLoading(true);
    const email = document.querySelector(
      ".reset-password-form-email input"
    ).value;
    const oldPassword = document.querySelector(
      ".reset-password-form-old-password input"
    ).value;
    const newPassword = document.querySelector(
      ".reset-password-form-new-password input"
    ).value;
    const reenterPassword = document.querySelector(
      ".reset-password-form-reenter-password input"
    ).value;

    if (newPassword !== reenterPassword) {
      setInfoPopupMessage("New passwords do not match");
      setInfoPopupTheme("error");
      setShowPopup(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      if (response.ok) {
        setInfoPopupMessage("Password reset successfully");
        setInfoPopupTheme("success");
      } else {
        setInfoPopupMessage("Failed to reset password");
        setInfoPopupTheme("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setInfoPopupMessage("An error occurred");
      setInfoPopupTheme("error");
    }

    setShowPopup(true);
    setIsLoading(false);
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
        <div className="reset-password-container">
          <div className="reset-password-form">
            <div className="reset-password-form-content">
              <h2>Reset Password</h2>
              <div className="reset-password-form-inputs">
                <div className="reset-password-form-email">
                  <p>Email</p>
                  <div>
                    <input
                      type="text"
                      className="input-container"
                      placeholder={"Enter your email"}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleResetPassword();
                        }
                      }}
                      inputMode="email"
                    />
                  </div>
                </div>
                <div className="reset-password-form-old-password">
                  <p>Old Password</p>
                  <div>
                    <input
                      type="password"
                      className="input-container"
                      placeholder={"Enter your old password"}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleResetPassword();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="reset-password-form-new-password">
                  <p>New Password</p>
                  <div>
                    <input
                      type="password"
                      className="input-container"
                      placeholder={"Enter your new password"}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleResetPassword();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="reset-password-form-reenter-password">
                  <p>Re-enter Password</p>
                  <div>
                    <input
                      type="password"
                      className="input-container"
                      placeholder={"Re-enter your password"}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleResetPassword();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                onClick={handleResetPassword}
                className="reset-password-form-button"
              >
                <div className="submit-button">Reset Password</div>
              </div>
            </div>
            <p className="reset-password-form-login">
              Remember your password? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
