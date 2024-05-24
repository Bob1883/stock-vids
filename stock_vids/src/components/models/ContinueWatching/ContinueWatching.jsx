import React, { useState, useEffect } from "react";
import axios from "axios";
import PlayButton from "../../../images/play-icon.svg";

import "./ContinueWatchingStyle.css";

const ContinueWatching = ({ OnClick }) => {
  const [continueWatchingList, setContinueWatchingList] = useState([]);

  useEffect(() => {
    fetchContinueWatchingList();
  }, []);

  const fetchContinueWatchingList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/continue-watching", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setContinueWatchingList(response.data);
    } catch (error) {
      console.error("Error fetching continue watching list:", error);
    }
  };

  return (
    <div className="continue-watching-container">
      <h2>Continue Watching</h2>
      {continueWatchingList.length === 0 ? (
        <p className="no-movies">No movies to continue watching.</p>
      ) : (
        <div className="continue-watching-list">
          {continueWatchingList.map((movie) => (
            <div
              className="continue-watching-movie"
              key={movie.id}
              onClick={() => OnClick(movie, movie.progress)}
            >
              <img src={movie.backdrop_url} alt={movie.title} />
              <div className="continue-watching-info">
                <h3>{movie.title}</h3>
                <div className="continue-watching-play-button">
                  <img src={PlayButton} alt="play button" />
                </div>
                <p>{movie.progress}% watched</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContinueWatching;
