import React, { useEffect, useState } from "react";
import Card from "../../models/Card/Card";
import "./WatchlistStyle.css";
import ContentView from "../../Views/ContentView/ContentView";
import Loading from "../Loading/Loading";

const Watchlist = () => {
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [showContentView, setShowContentView] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
          const movieIds = data.movieIds;
          const moviesData = await Promise.all(
            movieIds.map(async (movieId) => {
              const detailsResponse = await fetch(`/api/movies/${movieId}`);
              const detailsData = await detailsResponse.json();
              return {
                ...detailsData,
                Quality: detailsData.quality,
                Rating: detailsData.rating,
              };
            })
          );
          setWatchlistMovies(moviesData);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching watchlist:", error);
        }
      }
    };
    fetchWatchlist();
  }, []);

  const handleMovieClick = () => {
    setShowContentView(true);
  };

  const updateWatchlist = async () => {
    setWatchlistMovies([]);
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const response = await fetch("/watchlist", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        const movieIds = data.movieIds;
        const moviesData = await Promise.all(
          movieIds.map(async (movieId) => {
            const detailsResponse = await fetch(`/api/movies/${movieId}`);
            const detailsData = await detailsResponse.json();
            return {
              ...detailsData,
              Quality: detailsData.quality,
              Rating: detailsData.rating,
            };
          })
        );
        setWatchlistMovies(moviesData);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          <div
            className="watchlist-container"
            style={{ display: showContentView ? "none" : "block" }}
          >
            <div className="watchlist-cards-container">
              {watchlistMovies.map((movie, index) => (
                <div key={index}>
                  <Card
                    key={index}
                    IMG={movie.poster_url}
                    Title={movie.title}
                    Quality={movie.quality}
                    Rating={movie.rating.toFixed(1)}
                    ID={movie.id}
                    handleMovieClick={handleMovieClick}
                    setSelectedMovie={setSelectedMovie}
                    movie={movie}
                    isBookmarked={true}
                    updateWatchlist={updateWatchlist}
                  />
                </div>
              ))}
              <div className="invisible-card"></div>
              <div className="invisible-card"></div>
              <div className="invisible-card"></div>
              <div className="invisible-card"></div>
            </div>
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

export default Watchlist;
