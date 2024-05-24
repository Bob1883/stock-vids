import React, { useState, useEffect } from "react";

import "./InfoPopupStyle.css";

const InfoPopup = (props) => {
  let theme = "";
  switch (props.title) {
    case "info":
      theme = "info-popup-blue";
      break;
    case "warning":
      theme = "info-popup-yellow";
      break;
    case "success":
      theme = "info-popup-green";
      break;
    case "error":
      theme = "info-popup-red";
      break;
    default:
      theme = "";
      break;
  }

  const handleClose = () => {
    const popup = document.querySelector(".info-popup");
    popup.style.top = "-100%";
  };

  return (
    <div className="info-popup">
      <div className={`${theme}`}>
        <div className="info-popup-inner">
          <h3>{props.title}</h3>
          <p>{props.description}</p>
        </div>
        <div>
          <button className="info-popup-close" onClick={handleClose}>
            x
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoPopup;
