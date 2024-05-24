// Prop for adding a movie to the database. Would be removed in production.

import React, { useState } from "react";

const AddMovie = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [quality, setQuality] = useState("");
  const [year, setYear] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [posterImage, setPosterImage] = useState("");
  const [backdropImage, setBackdropImage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("genre", genre);
      formData.append("rating", rating);
      formData.append("quality", quality);
      formData.append("year", year);
      formData.append("video_url", videoUrl);
      formData.append("poster", posterImage);
      formData.append("backdrop", backdropImage);

      const response = await fetch("/api/movies", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        setGenre("");
        setRating("");
        setQuality("");
        setYear("");
        setVideoUrl("");
        setPosterImage(null);
        setBackdropImage(null);
        alert("Movie added successfully");
      } else {
        alert("Error adding movie");
      }
    } catch (error) {
      console.error("Error adding movie:", error);
      alert("Error adding movie");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "white",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Add Movie</h2>
      <form onSubmit={handleSubmit} style={{ width: "300px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: "100%", height: "100px" }}
          ></textarea>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="genre">Genre:</label>
          <input
            type="text"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="rating">Rating:</label>
          <input
            type="number"
            id="rating"
            step="0.1"
            min="0"
            max="10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="quality">Quality:</label>
          <input
            type="text"
            id="quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="year">Year:</label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="videoUrl">Video URL:</label>
          <input
            type="url"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="posterImage">Poster Image:</label>
          <input
            type="url"
            id="posterImage"
            value={posterImage}
            onChange={(e) => setPosterImage(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="backdropImage">Backdrop Image:</label>
          <input
            type="url"
            id="backdropImage"
            value={backdropImage}
            onChange={(e) => setBackdropImage(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit" style={{ width: "100%" }}>
          Add Movie
        </button>
      </form>
    </div>
  );
};

export default AddMovie;
