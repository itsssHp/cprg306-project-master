import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db, commentsCollection } from "../../app/src/_utils/firebase";
import {
  query,
  where,
  orderBy,
  getDocs,
  collection,
  addDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Authentication

const MovieDetails = () => {
  const router = useRouter();
  const { id } = router.query; // Extract movie ID from the URL
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cast, setCast] = useState(null); // State to store cast information
  const [comments, setComments] = useState([]); // State to store comments
  const [newComment, setNewComment] = useState(""); // State to hold new comment input
  const [currentUser, setCurrentUser] = useState(null); // State to store the authenticated user

  // Set up listener to track the current authenticated user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Store user info when logged in
      } else {
        setCurrentUser(null); // Clear user info when logged out
      }
    });

    return () => unsubscribe(); // Clean up on unmount
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = "#1c1917"; // Set the background color explicitly
    return () => {
      document.body.style.backgroundColor = ""; // Clean up when the component is unmounted
    };
  }, []);

  useEffect(() => {
    if (!id) return; // Avoid fetching before `id` is available

    const fetchMovieDetails = async () => {
      try {
        // Fetch movie details
        const movieResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        const movieData = await movieResponse.json();
        setMovie(movieData);

        // Fetch cast details
        const castResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        const castData = await castResponse.json();
        setCast(castData.cast); // Update cast state

        // Fetch comments for the movie
        const commentsQuery = query(
          commentsCollection,
          where("movieId", "==", id),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(commentsQuery);
        const commentsData = querySnapshot.docs.map((doc) => doc.data());
        setComments(commentsData);

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!newComment.trim()) return; // Don't submit empty comments

    try {
      if (!currentUser) {
        alert("Please log in to post comments."); // Alert if not logged in
        return;
      }

      // Add new comment to Firestore
      const newCommentData = {
        movieId: id,
        userId: currentUser.uid, // Use the actual user ID
        userName: currentUser.displayName || "Anonymous", // Use the user's display name or fallback to "Anonymous"
        comment: newComment,
        timestamp: new Date(),
      };

      await addDoc(collection(db, "comments"), newCommentData);

      // Optimistically update the comments state
      setComments((prevComments) => [newCommentData, ...prevComments]);

      // Clear the input after submitting
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found.</p>;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster+Available"; // Placeholder image URL
  const releaseDate = movie.release_date || "Release date not available";
  const rating =
    movie.vote_average !== undefined
      ? `${movie.vote_average}/10`
      : "Rating not available";
  const runtime = movie.runtime || "Runtime not available";

  const castList = cast
    ? cast
        .slice(0, 5)
        .map((actor) => actor.name)
        .join(", ")
    : "Cast not available";

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>{movie.title}</h1>
        <img src={posterUrl} alt={movie.title} style={styles.poster} />
        <p style={styles.overview}>{movie.overview}</p>
        <div style={styles.details}>
          <p>
            <strong>Release Date:</strong> {releaseDate}
          </p>
          <p>
            <strong>Rating:</strong> {rating}
          </p>
          <p>
            <strong>Run Time:</strong> {runtime} minutes
          </p>
          <p>
            <strong>Cast:</strong> {castList}
          </p>
        </div>

        <div style={styles.commentsSection}>
          <h2 style={styles.commentHeader}>Comments</h2>
          <div style={styles.commentList}>
            {comments.map((comment, index) => (
              <div key={index} style={styles.comment}>
                <p>
                  <strong>{comment.userName}:</strong> {comment.comment}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              style={styles.commentInput}
            />

            <button onClick={() => router.push("/")} style={styles.button}>
              Go Back to Home
            </button>
            <button type="submit" style={styles.button}>
              Post Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh", // Full height of the viewport
    width: "100%", // Full width of the page
    margin: 0, // Eliminate any margin
    padding: 0, // Eliminate any padding
    backgroundColor: "#1c1917", // Let the global background apply
    boxSizing: "border-box", // Consistent layout
    borderRadius: "20px",
  },
  content: {
    width: "100%",
    maxWidth: "900px",
    backgroundColor: "#333",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  commentHeader: {
    color: "white",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "15px",
    color: "white",
  },
  poster: {
    borderRadius: "10px",
    maxWidth: "100%",
    height: "auto",
    marginTop: "20px",
    marginBottom: "20px",
  },
  overview: {
    fontSize: "1rem",
    color: "white",
    lineHeight: "1.5",
    marginBottom: "20px",
  },
  details: {
    fontSize: "1.1rem",
    color: "white",
    marginTop: "20px",
  },
  button: {
    margin: "30px",
    padding: "10px 20px",
    backgroundColor: "#ea580c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.6)",
  },
  commentList: {
    marginTop: "20px",
  },
  comment: {
    backgroundColor: "#444",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    color: "white",
  },
  commentInput: {
    width: "95%",
    height: "100px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid orange",
    marginBottom: "10px",
    resize: "none",
    boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.6)",
  },
  submitButton: {
    backgroundColor: "#ea580c",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default MovieDetails;
