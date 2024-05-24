import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import ThumbsUp from "../../../images/thumbs_up.svg";
import SendIcon from "../../../images/send-icon.svg";
import LoadMoreIcon from "../../../images/load-more-icon.svg";
import "./ReviewScreenStyle.css";
import DropDownContainer from "../../Buttons/DropDownContainer/DropDownContainer";

const ReviewScreen = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState(10);
  const [visibleResponses, setVisibleResponses] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyComment, setReplyComment] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const formatTimestamp = (timestamp) => {
    const currentTime = new Date();
    const commentTime = new Date(timestamp);
    const timeDiff = currentTime - commentTime;

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (weeks > 0) {
      return `${weeks}w ago`;
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return "Just now";
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/${movieId}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const reviewsData = response.data;
      const reviewsWithResponses = await Promise.all(
        reviewsData.map(async (review) => {
          const responsesResponse = await axios.get(
            `/api/get_responses/${review.id}`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          return {
            ...review,
            responses: responsesResponse.data,
          };
        })
      );
      setReviews(reviewsWithResponses);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarClick = (rating) => {
    setRating(rating);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/reviews",
        {
          movieId,
          rating,
          comment,
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleResponseSubmit = async (
    reviewId,
    responseTag,
    responseComment
  ) => {
    try {
      const review_id = reviewId;
      const tag = responseTag;
      const comment = responseComment;
      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 2);
      const created_at = currentDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      if (comment) {
        // Check if comment is not empty or undefined
        await axios.post(
          `/api/respond`,
          {
            review_id,
            tag,
            comment,
            created_at,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        fetchReviews();
        setReplyingTo(null);
        setReplyComment("");
      } else {
        console.error("Comment cannot be empty");
      }
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const handleLoadMoreReviews = () => {
    setVisibleReviews((prevVisibleReviews) => prevVisibleReviews + 10);
  };

  const handleLoadMoreResponses = (reviewId) => {
    setVisibleResponses((prevVisibleResponses) => ({
      ...prevVisibleResponses,
      [reviewId]: (prevVisibleResponses[reviewId] || 5) + 5,
    }));
  };

  const handleReplyClick = (reviewId) => {
    if (replyingTo === reviewId) {
      setReplyingTo(null);
    } else {
      setReplyingTo(reviewId);
    }
  };

  const handleLikeReview = async (reviewId) => {
    try {
      const response = await axios.post(`/api/reviews/${reviewId}/like`, null, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                userLikeStatus: response.data.likeStatus,
                likes: response.data.likes,
                dislikes: response.data.dislikes,
              }
            : review
        )
      );
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  const handleDislikeReview = async (reviewId) => {
    try {
      const response = await axios.post(
        `/api/reviews/${reviewId}/dislike`,
        null,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                userLikeStatus: response.data.likeStatus,
                likes: response.data.likes,
                dislikes: response.data.dislikes,
              }
            : review
        )
      );
    } catch (error) {
      console.error("Error disliking review:", error);
    }
  };

  const RenderComment = ({ comment }) => {
    const [showFullComment, setShowFullComment] = useState(false);

    const toggleComment = () => {
      setShowFullComment((prevState) => !prevState);
    };

    if (comment.length <= 400) {
      return <p>{comment}</p>;
    } else {
      const truncatedComment = comment.slice(0, 400) + "...";
      return (
        <>
          <p>
            {showFullComment ? comment : truncatedComment}
            <span className="review-read-more" onClick={toggleComment}>
              {showFullComment ? "   Show less" : "   Read more"}
            </span>
          </p>
        </>
      );
    }
  };

  return (
    <div className="review-screen">
      <form onSubmit={handleSubmitReview} className="review-form">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="review-comment-textarea"
          placeholder="Write a review..."
        />
        <div className="review-form-actions">
          <button type="submit" className="review-submit-button">
            <img src={SendIcon} alt="" />
            Submit
          </button>
          <div className="review-star-rating">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <label key={starValue}>
                  <input
                    type="radio"
                    name="rating"
                    value={starValue}
                    onClick={() => handleStarClick(starValue)}
                    style={{ display: "none" }}
                  />
                  <FaStar
                    className="review-star"
                    color={
                      starValue <= (hoverRating || rating)
                        ? "#FFA940"
                        : "#5F5F5F"
                    }
                    onMouseEnter={() => handleStarHover(starValue)}
                    onMouseLeave={() => handleStarHover(0)}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </form>
      <div className="review-comment-list">
        {reviews.slice(0, visibleReviews).map((review) => (
          <div key={review.id} className="review-comment-item">
            <div className="review-comment-header">
              <DropDownContainer
                avatar={review.username}
                buttonStyle={{
                  padding: "0",
                  backgroundColor: "transparent",
                  pointerEvents: "none",
                }}
              ></DropDownContainer>
              <div className="review-comment-header-info">
                <p className="review-comment-header-name">{review.username}</p>
                <div className="review-comment-header-bottom">
                  <div className="review-comment-header-rating">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className="review-comment-header-star"
                        color={index < review.rating ? "#FFA940" : "#5F5F5F"}
                      />
                    ))}
                  </div>
                  <div className="separator-dot" />
                  <p className="review-comment-header-date">
                    {formatTimestamp(review.created_at)}
                  </p>
                </div>
              </div>
            </div>
            <div className="review-comment-text">
              <RenderComment comment={review.comment} />
            </div>
            <div className="review-comment-footer">
              <p>Likes: {review.likes - review.dislikes}</p>
              <div className="separator-dot" />
              <button
                className={`review-comment-like ${
                  review.userLikeStatus === "like" ? "liked" : ""
                }`}
                onClick={() => handleLikeReview(review.id)}
              >
                <img src={ThumbsUp} alt="" />
              </button>
              <button
                className={`review-comment-dislike ${
                  review.userLikeStatus === "dislike" ? "disliked" : ""
                }`}
                onClick={() => handleDislikeReview(review.id)}
              >
                <img src={ThumbsUp} alt="" />
              </button>
            </div>
            <div>
              {replyingTo === review.id && (
                <div className="review-comment-reply">
                  <textarea
                    value={review.replyComment || ""}
                    onChange={(e) =>
                      setReviews((prevReviews) =>
                        prevReviews.map((r) =>
                          r.id === review.id
                            ? { ...r, replyComment: e.target.value }
                            : r
                        )
                      )
                    }
                    placeholder={`@${review.username} `}
                    className="review-reply-comment-textarea"
                  />
                  <button
                    onClick={() =>
                      handleResponseSubmit(
                        review.id,
                        review.username,
                        review.replyComment
                      )
                    }
                    className="review-comment-reply-button"
                  >
                    <img src={SendIcon} alt="" />
                  </button>
                </div>
              )}
            </div>
            <div className="review-comment-responses">
              {review.responses
                .slice(0, visibleResponses[review.id] || 5)
                .map((response, index) => (
                  <div key={index} className="review-comment-response">
                    <div className="respons-comment-header">
                      <DropDownContainer
                        avatar={response.username}
                        buttonStyle={{
                          padding: "0",
                          backgroundColor: "transparent",
                          pointerEvents: "none",
                          transform: "scale(0.9) translateX(-5px)",
                        }}
                      ></DropDownContainer>
                      <div className="respons-comment-header-info">
                        <p className="respons-comment-header-name">
                          {response.username}
                        </p>
                        <div className="respons-comment-header-bottom">
                          <RenderComment
                            comment={formatTimestamp(response.created_at)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="review-comment-text">
                      <RenderComment comment={response.comment} />
                    </div>
                  </div>
                ))}
              {review.responses.length > (visibleResponses[review.id] || 5) && (
                <div
                  className="load-more-responses"
                  onClick={() => handleLoadMoreResponses(review.id)}
                >
                  <img src={LoadMoreIcon} alt="" />
                  <p>Load more</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {reviews.length > visibleReviews && (
          <div className="load-more-comments" onClick={handleLoadMoreReviews}>
            <p>Load more comments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewScreen;
