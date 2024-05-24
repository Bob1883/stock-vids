import React, { useState, useRef, useEffect } from "react";
import PlayButton from "../../../images/play-icon.svg";
import PauseButton from "../../../images/pause-icon.svg";
import Settings from "../../../images/settings-icon.svg";
import FullScreen from "../../../images/fullscreen-icon.svg";
import Loading from "../../Views/Loading/Loading";
import ReactPlayer from "react-player";
import Forward from "../../../images/forward.png";
import Backward from "../../../images/backward.png";
import DropIcon from "../../../images/drop-icon.svg";
import screenfull from "screenfull";
import "./MediaPlayerStyle.css";

import axios from "axios";

const MediaPlayer = ({ Title, URL, ID, Progress = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef(null);
  const hideControlsTimeout = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [initialProgress, setInitialProgress] = useState(0);
  const [prevMovieID, setPrevMovieID] = useState(0);

  useEffect(() => {
    const updateProgressBar = () => {
      if (!isDragging && playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
      requestAnimationFrame(updateProgressBar);
    };

    requestAnimationFrame(updateProgressBar);
  }, [isDragging]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const updateWatchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "/api/watch-history",
          {
            movieId: ID,
            progress: currentTime,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Error updating watch history:", error);
      }
    };

    const interval = setInterval(updateWatchHistory, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentTime]);

  const handleDrag = (event) => {
    if (isDragging) {
      const progressBarContainer = event.target.closest(
        ".media-progress-back-container"
      );
      if (progressBarContainer) {
        const containerRect = progressBarContainer.getBoundingClientRect();
        const dragX = event.clientX - containerRect.left;
        const seekPercentage = dragX / containerRect.width;
        const seekTime = seekPercentage * duration;
        playerRef.current.seekTo(seekTime);
      }
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleSeek = (event) => {
    const progressBarContainer = event.target.closest(
      ".media-progress-back-container"
    );
    if (progressBarContainer) {
      const containerRect = progressBarContainer.getBoundingClientRect();
      const clickX = event.clientX - containerRect.left;
      const seekPercentage = clickX / containerRect.width;
      const seekTime = seekPercentage * duration;
      playerRef.current.seekTo(seekTime);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      const player = playerRef.current;
      if (player) {
        const videoElement = player.getInternalPlayer();
        setIsFullScreen(
          screenfull.isFullscreen || videoElement.webkitDisplayingFullscreen
        );
      }
    };

    if (screenfull.isEnabled) {
      screenfull.on("change", handleFullScreenChange);
    } else {
      document.addEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off("change", handleFullScreenChange);
      } else {
        document.removeEventListener(
          "webkitfullscreenchange",
          handleFullScreenChange
        );
      }
    };
  }, []);

  const handleFullScreen = () => {
    const player = playerRef.current;
    if (player) {
      const videoElement = player.getInternalPlayer();
      if (screenfull.isEnabled) {
        if (screenfull.isFullscreen) {
          screenfull.exit();
        } else {
          screenfull.request(videoElement);
        }
      } else if (videoElement.webkitSupportsFullscreen) {
        if (videoElement.webkitDisplayingFullscreen) {
          videoElement.webkitExitFullscreen();
        } else {
          videoElement.webkitEnterFullscreen();
        }
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setVolume(isMuted ? 0.5 : 0);
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
  };

  const handleReady = () => {
    if (isLoading) {
      setTimeout(() => {
        playerRef.current.seekTo(Progress);
        setPrevMovieID(ID);
      }, 300);
    }
    console.log("ready");
    setIsLoading(false);
  };

  const skipForward = () => {
    const newTime = currentTime + 10;
    playerRef.current.seekTo(newTime);
  };

  const skipBackward = () => {
    const newTime = currentTime - 10;
    playerRef.current.seekTo(newTime);
  };

  const progressPercentage = (currentTime / duration) * 100;

  return (
    <div className="media-player-container">
      <div className="media-player-inner">
        <ReactPlayer
          ref={playerRef}
          url={URL}
          playing={isPlaying}
          controls={isFullScreen} // Show browser's default controls in full-screen mode
          height={"100%"}
          width={"100%"}
          onDuration={handleDuration}
          style={{
            filter:
              showControls && !isFullScreen
                ? "brightness(0.5)"
                : "brightness(1)",
          }}
          className="media-player"
          volume={isMuted ? 0 : volume}
          playbackRate={playbackRate}
          onReady={handleReady}
          playsinline // to hide default controls on iOS devices
        />
        {!isFullScreen && (
          <div
            className={`media-controls`}
            style={{ opacity: showControls ? "1" : "0" }}
            onMouseLeave={() => setShowControls(false)}
            onMouseMove={() => {
              setShowControls(true);
              clearTimeout(hideControlsTimeout.current);
              hideControlsTimeout.current = setTimeout(() => {
                setShowControls(false);
              }, 4000);
            }}
          >
            <div className="media-playback">
              <button className="media-backward" onClick={skipBackward}>
                <img src={Backward} alt="" />
              </button>
              <button onClick={togglePlayPause} className="play-pause">
                {isLoading ? (
                  <div className="loader" title="2">
                    <svg
                      version="1.1"
                      id="loader-1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      x="0px"
                      y="0px"
                      width="80px"
                      height="80px"
                      viewBox="0 0 50 50"
                      style={{ enableBackground: "new 0 0 50 50" }}
                      xmlSpace="preserve"
                    >
                      <path
                        fill="#000"
                        d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"
                      >
                        <animateTransform
                          attributeType="xml"
                          attributeName="transform"
                          type="rotate"
                          from="0 25 25"
                          to="360 25 25"
                          dur="0.8s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>
                  </div>
                ) : (
                  <img
                    src={isPlaying ? PauseButton : PlayButton}
                    alt="play-pause"
                  />
                )}
              </button>
              <button className="media-forward" onClick={skipForward}>
                <img src={Forward} alt="" />
              </button>
            </div>
            <div className="media-progress-bar-container">
              <div className="media-progress-time">
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <img src={FullScreen} alt="" onClick={handleFullScreen} />
              </div>
              <div
                className="media-progress-back-container"
                onClick={handleSeek}
                onMouseDown={handleDragStart}
                onMouseUp={handleDragEnd}
                onMouseMove={handleDrag}
              >
                <div className="media-progress-back">
                  <div
                    className="media-progress-bar"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div
                  className="media-progress-dot"
                  style={{ left: `${progressPercentage}%` }}
                />
              </div>
            </div>
            {/* <div className="media-volume-container">
            <button className="media-mute" onClick={toggleMute}>
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div> */}
            {/* <div className="media-playback-rate">
            <button onClick={() => handlePlaybackRateChange(0.5)}>0.5x</button>
            <button onClick={() => handlePlaybackRateChange(1)}>1x</button>
            <button onClick={() => handlePlaybackRateChange(1.5)}>1.5x</button>
            <button onClick={() => handlePlaybackRateChange(2)}>2x</button>
          </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPlayer;
