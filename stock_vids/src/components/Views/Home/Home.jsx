import React, { useState, useEffect } from "react";

import BackDropImage from "../../models/BackDropImage/BackDropImage";
import RecomendedImg from "../../../images/cow2.png";
import MediaPlayer from "../../models/MediaPlayer/MediaPlayer";
import ContinueWatching from "../../models/ContinueWatching/ContinueWatching";

import Back from "../../../images/back-icon.svg";

import "./HomeStyle.css";

const Home = () => {
  const [playMovie, setPlayMovie] = useState(false);
  const [Title, setTitle] = useState("");
  const [URL, setURL] = useState("");
  const [ID, setID] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleMovieClick = (movie, progress) => {
    setTitle(movie.title);
    setURL(movie.video_url);
    setID(movie.id);
    setProgress(progress);
    setPlayMovie(true);
  };

  return (
    <div>
      {playMovie ? (
        <div>
          <div
            className="home-recomended-back"
            onClick={() => setPlayMovie(false)}
          >
            <img src={Back} alt="back button" />
          </div>
          <MediaPlayer Title={Title} URL={URL} ID={ID} Progress={progress} />
        </div>
      ) : (
        <div style={{ cursor: "pointer" }}>
          <BackDropImage
            RecomendedImg={RecomendedImg}
            Title={"cow 2"}
            Quality={"HD"}
            Age={9.5}
            Rating={9.5}
            Year={2001}
            Description={"A cow in the field"}
            setPlayMovie={setPlayMovie}
            setIsView={false}
            ID={2}
          />
          <ContinueWatching OnClick={handleMovieClick} />
        </div>
      )}
    </div>
  );
};

export default Home;
