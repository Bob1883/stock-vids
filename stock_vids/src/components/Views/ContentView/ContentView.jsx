import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

import Loading from "../Loading/Loading";
import MediaPlayer from "../../models/MediaPlayer/MediaPlayer";
import ReviewScreen from "../../models/ReviewScreen/ReviewScreen";
import Card from "../../models/Card/Card";

import BackDropImage from "../../models/BackDropImage/BackDropImage";
import Back from "../../../images/back-icon.svg";
import InfoPopup from "../../models/InfoPopup/InfoPopup";

import "./ContentViewStyle.css";

const ContentView = ({
  Title,
  Quality,
  Rating,
  ID,
  Year,
  Description,
  setShowContentView,
  setIsView,
  backdrop_url,
  movie_url,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [playMovie, setPlayMovie] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [infoPopupMessage, setInfoPopupMessage] = useState("");
  const [infoPopupTheme, setInfoPopupTheme] = useState("info");

  //  is equal to Title
  const [title, setTitle] = useState(Title);
  const [quality, setQuality] = useState(Quality);
  const [rating, setRating] = useState(Rating);
  const [id, setID] = useState(ID);
  const [year, setYear] = useState(Year);
  const [description, setDescription] = useState(Description);
  const [backdrop, setBackdrop_url] = useState(backdrop_url);
  const [movie_src, setMovie_url] = useState(movie_url);

  const handlePopup = () => {
    const popup = document.querySelector(".info-popup");
    popup.style.top = "3%";
    setTimeout(() => {
      popup.style.top = "-100%";
    }, 4000);
  };

  const handleMovieClick = async (movie) => {
    setIsLoading(true);
    setTitle(movie.title);
    setQuality(movie.quality);
    setRating(movie.rating);
    setID(movie.id);
    setYear(movie.year);
    setDescription(movie.description);
    setBackdrop_url(movie.backdrop_url);
    setMovie_url(movie.video_url);

    try {
      const response = await axios.get(`/api/movies/${movie.id}`);
      const data = response.data;
      setIsLoading(false);
    } catch (error) {
      setInfoPopupMessage("Error fetching movie details");
      setInfoPopupTheme("error");
      handlePopup();
      setShowPopup(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      try {
        const response = await axios.get(`/api/movies?page=1&limit=10`);
        const data = response.data;
        setRecommendedMovies(data);
      } catch (error) {
        setInfoPopupMessage("Error fetching recommended movies");
        setInfoPopupTheme("error");
        handlePopup();
        setShowPopup(true);
      }
    };
    const fetchBackdrop = async () => {
      try {
        const response = await axios.get(`/api/movies/${ID}`);
        const data = response.data;
        setIsLoading(false);
      } catch (error) {
        setInfoPopupMessage("Error fetching backdrop");
        setInfoPopupTheme("error");
        handlePopup();
        setShowPopup(true);
        setIsLoading(false);
      }
    };

    fetchBackdrop();
    fetchRecommendedMovies();
  }, [ID]);

  const handleBack = () => {
    setShowContentView(false);
  };

  return (
    <div className="content-view-container">
      <div className="info-popup-container">
        <InfoPopup
          trigger={showPopup}
          title={infoPopupTheme}
          description={infoPopupMessage}
          className="info-popup"
        />
      </div>
      {isLoading ? (
        <div></div>
      ) : (
        <>
          {playMovie ? (
            <div>
              <div className="recomended-back" onClick={handleBack}>
                <img src={Back} alt="back button" />
              </div>
              <MediaPlayer Title={title} URL={movie_src} ID={id} />
            </div>
          ) : (
            <>
              <BackDropImage
                RecomendedImg={backdrop}
                Title={title}
                Quality={quality}
                Rating={rating}
                Year={year}
                Description={description}
                setPlayMovie={setPlayMovie}
                ID={id}
                setIsView={setIsView}
                handleBack={handleBack}
              />
            </>
          )}

          <div className="recommended-movies-section">
            <div className="recommended-movies-container">
              {recommendedMovies.map(
                (movie) =>
                  movie.id !== id && (
                    <Card
                      key={movie.id}
                      IMG={movie.poster_url}
                      Title={movie.title}
                      Quality={movie.quality}
                      Rating={movie.rating}
                      ID={movie.id}
                      handleMovieClick={() => handleMovieClick(movie)}
                      setSelectedMovie={() => {}}
                      movie={movie}
                      isBookmarked={false}
                    />
                  )
              )}
            </div>
          </div>

          <ReviewScreen movieId={id} />
        </>
      )}
    </div>
  );
};

export default ContentView;
