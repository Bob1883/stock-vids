const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const axios = require('axios');
const cheerio = require('cheerio');
const base64 = require('base-64');
const Levenshtein = require('levenshtein');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config({ path: "./.env" });

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a MySQL connection
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

// Secret key for JWT
const secretKey = process.env.JWT_SECRET_KEY;

// Middleware to authenticate the token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  // Query the database for the user
  connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: user.id }, secretKey);

      res.json({ token });
    });
  });
});

app.post('/reset-password', (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  // Check if email, old password, and new password are provided
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide email, old password, and new password' });
  }

  // Query the database for the user
  connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    const user = results[0];

    // Compare the provided old password with the hashed password in the database
    bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid old password' });
      }

      // Hash the new password
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        // Update the user's password in the database
        connection.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (error, results) => {
          if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }

          res.json({ message: 'Password reset successfully' });
        });
      });
    });
  });
});

// Registration route
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  // Generate username from email
  username = email.split('@')[0].split('.').join(' ');

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  // Check if the email already exists
  connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Insert the new user into the database
      connection.query('INSERT INTO users (email, password, username) VALUES (?, ?, ?)', [email, hashedPassword, username], (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'User registered successfully' });
      });
    });
  });
});

// Add movie to watchlist
app.post('/add_watchlist', authenticateToken, (req, res) => {
  const { userId } = req.user;
  const { movieId } = req.body;

  // Check if the movie is already in the user's watchlist
  connection.query('SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?', [userId, movieId], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length > 0) {
      // Movie already exists in the watchlist, remove it
      connection.query('DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?', [userId, movieId], (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Movie removed from watchlist' });
      });
    } else {
      // Movie doesn't exist in the watchlist, add it
      connection.query('INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)', [userId, movieId], (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Movie added to watchlist' });
      });
    }
  });
});

app.post('/api/reviews/:reviewId/like', authenticateToken, (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.userId;

  const checkQuery = `
      SELECT like_type
      FROM review_likes
      WHERE review_id = ? AND user_id = ?
    `;

  connection.query(checkQuery, [reviewId, userId], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking like status:', checkError);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const existingLikeType = checkResults.length > 0 ? checkResults[0].like_type : null;

      let query;
      if (existingLikeType === 'like') {
        // User already liked, remove the like
        query = `
            DELETE FROM review_likes
            WHERE review_id = ? AND user_id = ?
          `;
      } else if (existingLikeType === 'dislike') {
        // User disliked, update to like
        query = `
            UPDATE review_likes
            SET like_type = 'like'
            WHERE review_id = ? AND user_id = ?
          `;
      } else {
        // User hasn't liked or disliked, add a new like
        query = `
            INSERT INTO review_likes (review_id, user_id, like_type)
            VALUES (?, ?, 'like')
          `;
      }

      connection.query(query, [reviewId, userId], (error, results) => {
        if (error) {
          console.error('Error updating like status:', error);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          const countQuery = `
              SELECT 
                COUNT(CASE WHEN like_type = 'like' THEN 1 END) AS likes,
                COUNT(CASE WHEN like_type = 'dislike' THEN 1 END) AS dislikes,
                (
                  SELECT like_type
                  FROM review_likes
                  WHERE review_id = ? AND user_id = ?
                  LIMIT 1
                ) AS user_like_status
              FROM review_likes
              WHERE review_id = ?
            `;

          connection.query(countQuery, [reviewId, userId, reviewId], (countError, countResults) => {
            if (countError) {
              console.error('Error fetching like/dislike counts:', countError);
              res.status(500).json({ error: 'Internal server error' });
            } else {
              const { likes, dislikes, user_like_status } = countResults[0];
              res.json({ likeStatus: user_like_status, likes, dislikes });
            }
          });
        }
      });
    }
  });
});

app.post('/api/reviews/:reviewId/dislike', authenticateToken, (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.userId;

  const checkQuery = `
      SELECT like_type
      FROM review_likes
      WHERE review_id = ? AND user_id = ?
    `;

  connection.query(checkQuery, [reviewId, userId], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking like status:', checkError);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const existingLikeType = checkResults.length > 0 ? checkResults[0].like_type : null;

      let query;
      if (existingLikeType === 'dislike') {
        // User already disliked, remove the dislike
        query = `
            DELETE FROM review_likes
            WHERE review_id = ? AND user_id = ?
          `;
      } else if (existingLikeType === 'like') {
        // User liked, update to dislike
        query = `
            UPDATE review_likes
            SET like_type = 'dislike'
            WHERE review_id = ? AND user_id = ?
          `;
      } else {
        // User hasn't liked or disliked, add a new dislike
        query = `
            INSERT INTO review_likes (review_id, user_id, like_type)
            VALUES (?, ?, 'dislike')
          `;
      }

      connection.query(query, [reviewId, userId], (error, results) => {
        if (error) {
          console.error('Error updating like status:', error);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          const countQuery = `
              SELECT 
                COUNT(CASE WHEN like_type = 'like' THEN 1 END) AS likes,
                COUNT(CASE WHEN like_type = 'dislike' THEN 1 END) AS dislikes,
                (
                  SELECT like_type
                  FROM review_likes
                  WHERE review_id = ? AND user_id = ?
                  LIMIT 1
                ) AS user_like_status
              FROM review_likes
              WHERE review_id = ?
            `;

          connection.query(countQuery, [reviewId, userId, reviewId], (countError, countResults) => {
            if (countError) {
              console.error('Error fetching like/dislike counts:', countError);
              res.status(500).json({ error: 'Internal server error' });
            } else {
              const { likes, dislikes, user_like_status } = countResults[0];
              res.json({ likeStatus: user_like_status, likes, dislikes });
            }
          });
        }
      });
    }
  });
});

// Get user's watchlist
app.get('/watchlist', authenticateToken, (req, res) => {
  const { userId } = req.user;

  // Fetch the user's watchlist from the database
  connection.query('SELECT * FROM watchlist WHERE user_id = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const movieIds = results.map((entry) => entry.movie_id);
    res.json({ movieIds });
  });
});

// API endpoint to submit a new review
app.post('/api/reviews', authenticateToken, (req, res) => {
  const { movieId, rating, comment } = req.body;
  const userId = req.user.userId;
  const query = 'INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)';
  connection.query(query, [userId, movieId, rating, comment], (error, results) => {
    if (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json({ message: 'Review submitted successfully' });
    }
  });
});

// API endpoint to submit a response to a review
app.post('/api/respond', authenticateToken, (req, res) => {
  const { review_id, tag, comment, created_at } = req.body;
  const user_id = req.user.userId;

  if (!comment) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  const query = 'INSERT INTO review_responses (review_id, user_id, tag, comment, created_at) VALUES (?, ?, ?, ?, ?)';

  connection.query(query, [review_id, user_id, tag, comment, created_at], (error, results) => {
    if (error) {
      console.error('Error submitting response:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    } else {
      res.json({ message: 'Response submitted successfully' });
    }
  }
  );
}
);

// API endpoint to fetch reviews
app.get('/api/reviews/:movieId', authenticateToken, (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.userId;
  const query = `
      SELECT r.id, r.user_id, r.movie_id, r.rating, r.comment, r.created_at,
        u.username,
        COUNT(DISTINCT rl_like.id) AS likes,
        COUNT(DISTINCT rl_dislike.id) AS dislikes,
        MAX(IFNULL(rl_user.like_type, '')) AS user_like_type
      FROM reviews r
      LEFT JOIN review_likes rl_like ON r.id = rl_like.review_id AND rl_like.like_type = 'like'
      LEFT JOIN review_likes rl_dislike ON r.id = rl_dislike.review_id AND rl_dislike.like_type = 'dislike'
      LEFT JOIN review_likes rl_user ON r.id = rl_user.review_id AND rl_user.user_id = ?
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.movie_id = ?
      GROUP BY r.id
    `;
  connection.query(query, [userId, movieId], (error, results) => {
    if (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const reviewsWithLikeStatus = results.map(review => ({
        ...review,
        userLikeStatus: review.user_like_type,
      }));
      res.json(reviewsWithLikeStatus);
    }
  });
});

app.get('/api/get_username', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const query = 'SELECT username FROM users WHERE id = ?';
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching username:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const username = results[0].username;
      res.json({ username });
    }
  });
});

app.get('/api/get_responses/:reviewId', authenticateToken, (req, res) => {
  const { reviewId } = req.params;
  console.log(req.params);
  const query = `
      SELECT rr.id, rr.user_id, rr.tag, rr.comment, rr.created_at,
        u.username,
        COUNT(DISTINCT rl_like.id) AS likes,
        COUNT(DISTINCT rl_dislike.id) AS dislikes
      FROM review_responses rr
      LEFT JOIN users u ON rr.user_id = u.id
      LEFT JOIN review_likes rl_like ON rr.id = rl_like.review_id AND rl_like.like_type = 'like'
      LEFT JOIN review_likes rl_dislike ON rr.id = rl_dislike.review_id AND rl_dislike.like_type = 'dislike'
      WHERE rr.review_id = ?
      GROUP BY rr.id
    `;
  connection.query(query, [reviewId], (error, results) => {
    if (error) {
      console.error('Error fetching review responses:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/movies', (req, res) => {
  const { page, limit } = req.query;
  const offset = (page - 1) * limit;

  const query = 'SELECT * FROM movies LIMIT ? OFFSET ?';
  connection.query(query, [parseInt(limit), parseInt(offset)], (error, results) => {
    if (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/movies/:movieId', (req, res) => {
  const movieId = req.params.movieId;

  const query = 'SELECT * FROM movies WHERE id = ?';
  connection.query(query, [movieId], (error, results) => {
    if (error) {
      console.error('Error fetching movie:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: 'Movie not found' });
      } else {
        const movie = results[0];
        res.json(movie);
      }
    }
  });
});

app.post('/api/movies', upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'backdrop', maxCount: 1 }]), (req, res) => {
  const { title, description, genre, rating, quality, year, video_url, poster, backdrop } = req.body;

  const query = 'INSERT INTO movies (title, description, genre, rating, quality, year, video_url, poster_url, backdrop_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(query, [title, description, genre, rating, quality, year, video_url, poster, backdrop], (error, results) => {
    if (error) {
      console.error('Error adding movie:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json({ message: 'Movie added successfully' });
    }
  });
});

app.get('/api/search', (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM movies';
  let params = [];

  if (search) {
    query += ' WHERE title LIKE ?';
    params.push(`%${search}%`);
  }

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (search) {
        const searchResults = results.map(movie => ({
          ...movie,
          similarity: new Levenshtein(search.toLowerCase(), movie.title.toLowerCase()).distance
        }));

        const sortedResults = searchResults.sort((a, b) => a.similarity - b.similarity);
        const topResults = sortedResults.slice(0, 3);

        res.json(topResults);
      } else {
        res.json(results);
      }
    }
  });
});

// API endpoint to update watch history
app.post('/api/watch-history', authenticateToken, (req, res) => {
  const { movieId, progress } = req.body;
  const userId = req.user.userId;
  const lastWatched = new Date();

  const updateQuery = `
    UPDATE watch_history
    SET progress = ?, last_watched = ?
    WHERE user_id = ? AND movie_id = ?
  `;

  const insertQuery = `
    INSERT INTO watch_history (user_id, movie_id, progress, last_watched)
    SELECT ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM watch_history WHERE user_id = ? AND movie_id = ?
    )
  `;

  const deleteQuery = `
    DELETE FROM watch_history
    WHERE user_id = ? AND movie_id NOT IN (
      SELECT movie_id
      FROM (
        SELECT movie_id, last_watched
        FROM watch_history
        WHERE user_id = ?
        ORDER BY last_watched DESC
        LIMIT 10
      ) AS recent_movies
    )
  `;

  connection.query(updateQuery, [progress, lastWatched, userId, movieId], (updateError, updateResults) => {
    if (updateError) {
      console.error('Error updating watch history:', updateError);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      connection.query(insertQuery, [userId, movieId, progress, lastWatched, userId, movieId], (insertError, insertResults) => {
        if (insertError) {
          console.error('Error inserting watch history:', insertError);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          connection.query(deleteQuery, [userId, userId], (deleteError, deleteResults) => {
            if (deleteError) {
              console.error('Error deleting old watch history:', deleteError);
              res.status(500).json({ error: 'Internal server error' });
            } else {
              res.json({ message: 'Watch history updated successfully' });
            }
          });
        }
      });
    }
  });
});

app.get('/api/continue-watching', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const query = `
    SELECT m.*, wh.progress
    FROM watch_history wh
    JOIN movies m ON wh.movie_id = m.id
    WHERE wh.user_id = ?
    ORDER BY wh.last_watched DESC
  `;

  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching continue watching list:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});