import React, { useEffect, useState } from "react";
import CheckBox from "../../Buttons/CheckBox/CheckBox";
import Card from "../../models/Card/Card";
import { Pagination } from "antd";

import ContentView from "../../Views/ContentView/ContentView";
import Loading from "../Loading/Loading";
import DropDownContainer from "../../Buttons/DropDownContainer/DropDownContainer";
import DropIcon from "../../../images/drop-icon.svg";
import InfoPopup from "../../models/InfoPopup/InfoPopup";

import "./RandomStyle.css";

const Random = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [showContentView, setShowContentView] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedQualities, setSelectedQualities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [infoPopupMessage, setInfoPopupMessage] = useState("");
  const [infoPopupTheme, setInfoPopupTheme] = useState("info");

  const applyFilters = () => {
    let filtered = movies;

    if (selectedGenres.length > 0) {
      filtered = filtered.filter((movie) =>
        selectedGenres.some((genre) => movie.genres.includes(genre))
      );
    }

    if (selectedYears.length > 0) {
      filtered = filtered.filter((movie) =>
        selectedYears.includes(movie.year.toString())
      );
    }

    if (selectedRatings.length > 0) {
      filtered = filtered.filter((movie) =>
        selectedRatings.includes(movie.rating.toString())
      );
    }

    if (selectedQualities.length > 0) {
      filtered = filtered.filter((movie) =>
        selectedQualities.includes(movie.quality)
      );
    }

    setFilteredMovies(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [
    selectedGenres,
    selectedYears,
    selectedRatings,
    selectedQualities,
    movies,
  ]);

  const handlePopup = () => {
    const popup = document.querySelector(".info-popup");
    popup.style.top = "3%";
    setTimeout(() => {
      popup.style.top = "-100%";
    }, 4000);
  };

  const fetchMovies = async (page) => {
    const limit = 40;

    try {
      const response = await fetch(`/api/movies?page=${page}&limit=${limit}`);
      const data = await response.json();
      console.log(data);
      setMovies(data);
      setFilteredMovies(data);
      console.log(movies);
    } catch (error) {
      setInfoPopupMessage("Error fetching recommended movies");
      setInfoPopupTheme("error");
      handlePopup();
      setShowPopup(true);
    }
  };

  useEffect(() => {
    const fetchMoviesData = async () => {
      try {
        await fetchMovies(currentPage);
      } catch (error) {
        setInfoPopupMessage("Error fetching recommended movies");
        setInfoPopupTheme("error");
        handlePopup();
        setShowPopup(true);
      }
    };

    const fetchWatchlist = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await fetch("/watchlist", {
            headers: {
              authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          setWatchlist(data.movieIds);
        } catch (error) {
          setInfoPopupMessage("Error fetching watchlist");
          setInfoPopupTheme("error");
          handlePopup();
          setShowPopup(true);
        }
      }
    };

    fetchMoviesData();
    fetchWatchlist();
  }, [currentPage]);
  const handleMovieClick = () => {
    setShowContentView(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="info-popup-container">
        <InfoPopup
          trigger={showPopup}
          title={infoPopupTheme}
          description={infoPopupMessage}
          className="info-popup"
        />
      </div>
      {movies.length === 0 ? (
        <Loading />
      ) : (
        <div>
          <div
            className="random-container"
            style={{ display: showContentView ? "none" : "block" }}
          >
            {/* <div className="random-filter-container">
              <div className="random-filter" id="type-filter">
                <DropDownContainer
                  Text={"Genre"}
                  Icon={DropIcon}
                  Content={
                    <div className="random-filter-content">
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedGenres = selectedGenres.includes(
                              "action"
                            )
                              ? selectedGenres.filter(
                                  (genre) => genre !== "action"
                                )
                              : [...selectedGenres, "action"];
                            setSelectedGenres(updatedGenres);
                          }}
                        >
                          Action
                        </p>
                      </div>
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedGenres = selectedGenres.includes(
                              "comedy"
                            )
                              ? selectedGenres.filter(
                                  (genre) => genre !== "comedy"
                                )
                              : [...selectedGenres, "comedy"];
                            setSelectedGenres(updatedGenres);
                          }}
                        >
                          Comedy
                        </p>
                      </div>
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedGenres = selectedGenres.includes(
                              "drama"
                            )
                              ? selectedGenres.filter(
                                  (genre) => genre !== "drama"
                                )
                              : [...selectedGenres, "drama"];
                            setSelectedGenres(updatedGenres);
                          }}
                        >
                          Drama
                        </p>
                      </div>
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedGenres = selectedGenres.includes(
                              "horror"
                            )
                              ? selectedGenres.filter(
                                  (genre) => genre !== "horror"
                                )
                              : [...selectedGenres, "horror"];
                            setSelectedGenres(updatedGenres);
                          }}
                        >
                          Horror
                        </p>
                      </div>
                    </div>
                  }
                  buttonStyle={{ width: "fit-content" }}
                  contentStyle={{ right: "auto", left: "0" }}
                  dropdownTextStyle={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  flipIcon={true}
                />
              </div>
              <div className="random-filter" id="type-filter">
                <DropDownContainer
                  Text={"Year"}
                  Icon={DropIcon}
                  Content={
                    <div className="random-filter-content">
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedYears = selectedYears.includes("2010")
                              ? selectedYears.filter((year) => year !== "2010")
                              : [...selectedYears, "2010"];
                            setSelectedYears(updatedYears);
                          }}
                        >
                          2010
                        </p>
                      </div>
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedYears = selectedYears.includes("2011")
                              ? selectedYears.filter((year) => year !== "2011")
                              : [...selectedYears, "2011"];
                            setSelectedYears(updatedYears);
                          }}
                        >
                          2011
                        </p>
                      </div>
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedYears = selectedYears.includes("2012")
                              ? selectedYears.filter((year) => year !== "2012")
                              : [...selectedYears, "2012"];
                            setSelectedYears(updatedYears);
                          }}
                        >
                          2012
                        </p>
                      </div>
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedYears = selectedYears.includes("2013")
                              ? selectedYears.filter((year) => year !== "2013")
                              : [...selectedYears, "2013"];
                            setSelectedYears(updatedYears);
                          }}
                        >
                          2013
                        </p>
                      </div>
                    </div>
                  }
                  buttonStyle={{ width: "fit-content" }}
                  contentStyle={{ right: "auto", left: "0" }}
                  dropdownTextStyle={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  flipIcon={true}
                />
              </div>
              <div className="random-filter" id="type-filter">
                <DropDownContainer
                  Text={"Rating"}
                  Icon={DropIcon}
                  Content={
                    <div className="random-filter-content">
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedRatings = selectedRatings.includes("1")
                              ? selectedRatings.filter(
                                  (rating) => rating !== "1"
                                )
                              : [...selectedRatings, "1"];
                            setSelectedRatings(updatedRatings);
                          }}
                        >
                          1
                        </p>
                      </div>
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedRatings = selectedRatings.includes("2")
                              ? selectedRatings.filter(
                                  (rating) => rating !== "2"
                                )
                              : [...selectedRatings, "2"];
                            setSelectedRatings(updatedRatings);
                          }}
                        >
                          2
                        </p>
                      </div>
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedRatings = selectedRatings.includes("3")
                              ? selectedRatings.filter(
                                  (rating) => rating !== "3"
                                )
                              : [...selectedRatings, "3"];
                            setSelectedRatings(updatedRatings);
                          }}
                        >
                          3
                        </p>
                      </div>
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedRatings = selectedRatings.includes("4")
                              ? selectedRatings.filter(
                                  (rating) => rating !== "4"
                                )
                              : [...selectedRatings, "4"];
                            setSelectedRatings(updatedRatings);
                          }}
                        >
                          4
                        </p>
                      </div>
                    </div>
                  }
                  buttonStyle={{ width: "fit-content" }}
                  contentStyle={{ right: "auto", left: "0" }}
                  dropdownTextStyle={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  flipIcon={true}
                />
              </div>
              <div className="random-filter" id="type-filter">
                <DropDownContainer
                  Text={"Quality"}
                  Icon={DropIcon}
                  Content={
                    <div className="random-filter-content">
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedQualities = selectedQualities.includes(
                              "r"
                            )
                              ? selectedQualities.filter(
                                  (quality) => quality !== "r"
                                )
                              : [...selectedQualities, "r"];
                            setSelectedQualities(updatedQualities);
                          }}
                        >
                          R
                        </p>
                      </div>
                      <div className="random-filter-checkbox-container">
                        <CheckBox width={20} height={20} />
                        <p
                          onClick={() => {
                            const updatedQualities = selectedQualities.includes(
                              "pg-13"
                            )
                              ? selectedQualities.filter(
                                  (quality) => quality !== "pg-13"
                                )
                              : [...selectedQualities, "pg-13"];
                            setSelectedQualities(updatedQualities);
                          }}
                        >
                          PG-13
                        </p>
                      </div>
                    </div>
                  }
                  buttonStyle={{ width: "fit-content" }}
                  contentStyle={{ right: "auto", left: "0" }}
                  dropdownTextStyle={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  flipIcon={true}
                />
              </div>
            </div> */}
            <div className="cards-container">
              {filteredMovies.map((movie, index) => (
                // movie.quality == selectedQualities && movie.rating == selectedRatings && movie.year == selectedYears && movie.genres == selectedGenres &&
                <div key={index}>
                  <Card
                    key={index}
                    IMG={movie.poster_url}
                    Title={movie.title}
                    Quality={movie.quality}
                    Rating={movie.rating}
                    ID={movie.id}
                    handleMovieClick={handleMovieClick}
                    setSelectedMovie={setSelectedMovie}
                    movie={movie}
                    isBookmarked={watchlist.includes(movie.id.toString())}
                  />
                </div>
              ))}
            </div>
            {movies.length / 40 > 1 && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  total={movies.length}
                  pageSize={40}
                  showSizeChanger={false}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </div>

          {showContentView && (
            <ContentView
              Title={selectedMovie.title}
              Quality={selectedMovie.quality}
              Rating={selectedMovie.rating}
              ID={selectedMovie.id}
              Year={selectedMovie.year}
              Description={selectedMovie.description}
              setShowContentView={setShowContentView}
              setIsView={true}
              backdrop_url={selectedMovie.backdrop_url}
              movie_url={selectedMovie.video_url}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Random;
