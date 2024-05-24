import React from "react";
import { useEffect, useState } from "react";

import Star from "../../../images/star.svg";
import Play from "../../../images/play.svg";
import Bookmark from "../../../images/Bookmark-icon.svg";
import BookmarkFilled from "../../../images/bookmark-fill.svg";
import Back from "../../../images/back-icon.svg";

import "./BackDropImageStyle.css";

const BackDropImage = ({
  RecomendedImg,
  Title,
  Quality,
  Age,
  Rating,
  Year,
  Description,
  setPlayMovie,
  ID,
  setIsView,
  handleBack,
}) => {
  const [bookmarked, setBookmarked] = React.useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const fetchWatchlist = async () => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (token) {
      try {
        console.log("Fetching watchlist");
        console.log(ID);
        const response = await fetch("/watchlist", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setWatchlist(data.movieIds);

        if (data.movieIds.includes(String(ID))) {
          console.log("Movie is bookmarked");
          setBookmarked(true);
        }
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleBookmark = () => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("/add_watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId: ID }),
      })
        .then((response) => response.json())
        .then((data) => {
          setBookmarked(!bookmarked);
        })
        .catch((error) => {
          console.error("Error updating watchlist:", error);
        });
    } else {
      console.error("No token provided");
    }
  };

  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  console.log(Description);

  return (
    <div
      className="recomended-container"
      style={{ height: setIsView ? "100%" : "" }}
    >
      <img src={RecomendedImg} alt="recomended" className="recomended-img" />
      <div className="recomended-back" onClick={handleBack}>
        {setIsView ? <img src={Back} alt="back button" /> : ""}
      </div>
      <div
        className="recomended-info"
        style={{ marginBottom: setIsView ? "" : "0" }}
      >
        {Title && <p className="recomended-title">{Title}</p>}
        <div className="recomended-tags">
          {Quality && <div className="recomended-quality">{Quality}</div>}
          {Age && (
            <div className="recomended-age">
              {Age === "N/A" ? "Not Rated" : Age}
            </div>
          )}
          {Rating && (
            <div className="recomended-rating">
              <img src={Star} alt="star" className="recomended-star" />
              {parseFloat(Rating).toFixed(1)}
            </div>
          )}
          {Year && <div className="recomended-year">{Year}</div>}
        </div>
        {Description && (
          <div className="recomended-description">
            {Description.length <= 50 ? (
              <>{Description}</>
            ) : (
              <>
                {isCollapsed ? (
                  <>
                    {Description.split("").slice(0, 50).join("")}...
                    <span
                      className="recomended-description-toggle"
                      onClick={handleCollapse}
                    >
                      {" "}
                      Read More
                    </span>
                  </>
                ) : (
                  <>
                    {Description + " "}
                    <span
                      className="recomended-description-toggle"
                      onClick={handleCollapse}
                    >
                      Read Less
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        )}
        <div className="recomended-buttons">
          <div className="recomended-play" onClick={() => setPlayMovie(true)}>
            <img src={Play} alt="play" className="recomended-play-img" />
            Watch
          </div>
          <div className="recomended-bookmark" onClick={handleBookmark}>
            <img
              src={bookmarked ? BookmarkFilled : Bookmark}
              alt="bookmark"
              className="recomended-bookmark-img"
            />
            Bookmark
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackDropImage;
