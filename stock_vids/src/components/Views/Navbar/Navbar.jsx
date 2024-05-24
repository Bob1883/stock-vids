import React, { useState } from "react";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import md5 from "md5";

import DropDownContainer from "../../Buttons/DropDownContainer/DropDownContainer";

import Logo from "../../../images/logo.png";
import ExitIcon from "../../../images/exit-icon.svg";

import HomeIcon from "../../../images/home-icon.svg";
import RandomIcon from "../../../images/random-icon.svg";
import WatchlistIcon from "../../../images/watchlist-icon.svg";
import ContentView from "../../Views/ContentView/ContentView";

import Bell from "../../../images/bell-icon.svg";

import "./NavbarStyle.css";

const Navbar = ({
  setIsLoggedIn,
  setIsSearching,
  selectedIcon,
  setSelectedIcon,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showContentView, setShowContentView] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState({});
  const [blurTimer, setBlurTimer] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchData = async () => {
        const response = await fetch("/api/get_username", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUsername(data.username);
        console.log(username);
      };
      fetchData();
    }
  }, []);

  const iconRefs = {
    home: useRef(),
    random: useRef(),
    watchlist: useRef(),
  };
  const [siteLoaded, setSiteLoaded] = useState(false);

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      searchMovies(query);
    } else {
      setSearchResults([]);
    }
  };

  const searchMovies = async (query) => {
    try {
      const response = await fetch(`api/search?search=${query}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const resultsCanShow = () => {
    const searchResults = document.querySelector(".search-results");
    if (searchResults) {
      return true;
    }
    return false;
  };

  const handleIconClick = (icon) => {
    setShowContentView(false);
    setSelectedIcon(icon);
  };

  window.addEventListener("resize", () => {
    if (siteLoaded) {
      setSiteLoaded(false);
      setTimeout(() => {
        setSiteLoaded(true);
      }, 0);
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setTimeout(() => {
      window.location.href = "/login";
      setIsLoggedIn(false);
    }, 500);
  };

  const handleSearch = () => {
    setIsSearching(true);
  };

  const handleContentView = (movie) => {
    setSelectedMovie(movie);
    setShowContentView(true);
  };

  const handleSearchFocus = (event) => {
    setIsFocused(true);
    handleSearchChange(event);
  };

  setTimeout(() => {
    setSiteLoaded(true);
  }, 650);

  return (
    <>
      <div className="navbar">
        <img src={Logo} alt="logo" className="navbar-logo" />
        <div className="navbar-icons">
          <img
            ref={iconRefs.home}
            src={HomeIcon}
            alt="home"
            className={`navbar-icon ${
              selectedIcon === "home" ? "navbar-icons-active" : ""
            }`}
            onClick={() => handleIconClick("home")}
          />
          <img
            ref={iconRefs.random}
            src={RandomIcon}
            alt="random"
            className={`navbar-icon ${
              selectedIcon === "random" ? "navbar-icons-active" : ""
            }`}
            onClick={() => handleIconClick("random")}
          />
          <img
            ref={iconRefs.watchlist}
            src={WatchlistIcon}
            alt="watchlist"
            className={`navbar-icon ${
              selectedIcon === "watchlist" ? "navbar-icons-active" : ""
            }`}
            onClick={() => handleIconClick("watchlist")}
          />
          {siteLoaded && (
            <motion.div
              className="navbar-slider"
              initial={selectedIcon}
              animate={{
                top: iconRefs[selectedIcon]?.current?.offsetTop,
                height: iconRefs[selectedIcon]?.current?.clientHeight,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </div>
        {/* <img
          src={ExitIcon}
          alt="exit"
          className="exit-icon"
          onClick={handleLogout}
        /> */}
        <div></div>
      </div>
      <div className="navbar-top-right">
        <div
          className="search-container-wrapper"
          style={{ width: isFocused ? "300px" : "" }}
        >
          <input
            type="text"
            className="search-container"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={() => {
              const timer = setTimeout(() => {
                setIsFocused(false);
              }, 200);
              setBlurTimer(timer);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (blurTimer) {
                clearTimeout(blurTimer);
                setBlurTimer(null);
              }
            }}
          />
          {isFocused && searchResults.length > 0 && (
            <div
              className="search-results"
              style={{ opacity: resultsCanShow() ? 1 : 0 }}
              onClick={(e) => {
                e.stopPropagation();
                if (blurTimer) {
                  clearTimeout(blurTimer);
                  setBlurTimer(null);
                }
              }}
            >
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="search-result"
                  onClick={() => handleContentView(movie)}
                >
                  <img
                    src={movie.poster_url}
                    className="search-poster"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.backgroundColor = "gray";
                      e.target.src = "";
                    }}
                  />
                  <span className="search-title">
                    {movie.title || movie.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <DropDownContainer Icon={Bell} Content={<div></div>} />
        { username &&
        <DropDownContainer
          avatar={username}
          Content={
            <div>
              <p onClick={handleLogout} className="logout">
                Logout
              </p>
            </div>
          }
          buttonStyle={{ padding: "0", backgroundColor: "transparent" }}
        ></DropDownContainer>}
      </div>

      {showContentView && (
        <div className="navbar-content-view">
          <ContentView
            Title={selectedMovie.title}
            Quality={selectedMovie.quality}
            Rating={selectedMovie.rating}
            ID={selectedMovie.id}
            Year={selectedMovie.year}
            Description={selectedMovie.description}
            setShowContentView={setShowContentView}
            setIsView={setShowContentView}
            backdrop_url={selectedMovie.backdrop_url}
            movie_url={selectedMovie.video_url}
          />
        </div>
      )}
    </>
  );
};

export default Navbar;
