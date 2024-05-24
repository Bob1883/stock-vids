import React from "react";
import { useState, useEffect } from "react";
import Bookmark from "../../../images/Bookmark-icon.svg";
import BookmarkFilled from "../../../images/bookmark-fill.svg";
import InfoPopup from "../../models/InfoPopup/InfoPopup";
import "./CardStyle.css";

const Card = ({
  IMG,
  Title,
  Quality,
  Rating,
  ID,
  handleMovieClick,
  setSelectedMovie,
  movie,
  isBookmarked,
  updateWatchlist,
}) => {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [popups, setPopups] = useState([]);

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
          addPopup("Watchlist updated", "success");
          console.log(data);
        })
        .catch((error) => {
          addPopup("Error updating watchlist", "error");
        });
    } else {
      addPopup("Invalid token", "error");
    }
    // to stop the watchlist from updating multiple times
    setTimeout(() => {
      if (updateWatchlist) {
        updateWatchlist();
      }
    }, 100);
  };

  const addPopup = (description, title) => {
    const newPopup = {
      id: Date.now(),
      description,
      title,
    };
    setPopups([...popups, newPopup]);
  };

  const removePopup = (id) => {
    setPopups(popups.filter((popup) => popup.id !== id));
  };

  const handleSelectedMovie = () => {
    handleMovieClick();
    setSelectedMovie(movie);
  };

  return (
    <div>
      {popups.map((popup) => (
        <InfoPopup
          key={popup.id}
          props={{
            title: popup.title,
            description: popup.description,
          }}
          onClose={() => removePopup(popup.id)}
        />
      ))}
      <div className="card-container">
        <img
          src={IMG}
          alt="movie"
          className="card-img"
          onClick={handleSelectedMovie}
        />
        <div className="card-content">
          <div className="card-details">
            <div className="card-quality">
              <p>{Quality === "N/A" ? "Not Rated" : Quality}</p>
            </div>
            <div className="card-rating">
              <p>{Rating}</p>
            </div>
            <div className="bookmark" onClick={handleBookmark}>
              <img
                src={bookmarked ? BookmarkFilled : Bookmark}
                alt="bookmark"
              />
            </div>
          </div>
          <div className="card-title">
            <p>{Title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
