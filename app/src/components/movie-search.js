import { useState } from "react";
import Link from "next/link";

const MovieSearch = () => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const searchMovies = async (newQuery, pageToFetch = 1) => {
    const currentQuery = newQuery !== undefined ? newQuery : query;
    if (!currentQuery.trim()) return; // Prevent empty queries

    const response = await fetch(
      `/api/searchMovies?query=${encodeURIComponent(
        currentQuery
      )}&page=${pageToFetch}`
    );
    const data = await response.json();

    if (pageToFetch === 1) {
      // Reset movies for a new search
      setMovies(data.results || []);
    } else {
      // Append to existing movies
      setMovies((prev) => [...prev, ...(data.results || [])]);
    }

    setHasMore(data.page < data.total_pages); // Check if more pages are available
    setSearchPerformed(true);
    setPage(pageToFetch); // Update the current page
  };

  const handleSearch = () => {
    setPage(1); // Reset to the first page
    searchMovies(query, 1);
  };

  const loadMoreMovies = () => {
    searchMovies(undefined, page + 1);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {/* Search Input */}
      <div>
        <input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.searchBar}
        />
        <button onClick={handleSearch} style={styles.searchButton}>
          Search
        </button>
        {searchPerformed ? (
          <p style={{ fontWeight: "bold" }}>Displaying Results for {query}:</p>
        ) : null}
      </div>

      {/* Movie Results */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "20px",
          color: "black",
          fontWeight: "bold",
        }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              margin: "10px",
              padding: "10px",
              width: "200px",
              textAlign: "center",
              backgroundColor: "#fff",
            }}
          >
            {/* Wrap movie details in a Link */}
            <Link
              href={`/movies/${movie.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                style={{
                  borderRadius: "10px",
                  marginBottom: "10px",
                  width: "100%",
                }}
              />
              <h3 style={{ fontSize: "16px", margin: "10px 0" }}>
                {movie.title}
              </h3>
            </Link>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <button onClick={loadMoreMovies} style={styles.loadMoreButton}>
          Load More
        </button>
      )}
    </div>
  );
};

export default MovieSearch;

const styles = {
  searchBar: {
    marginBottom: "20px",
    borderRadius: "10px",
    color: "white",
    border: "1px solid black",
    backgroundColor: "white",
    padding: "5px",
    backgroundColor: "#27272a",
  },
  searchButton: {
    backgroundColor: "#ea580c",
    borderRadius: "10px",
    margin: "10px",
    width: "100px",
    textAlign: "center",
    padding: "8px",
    boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.6)",
  },
  loadMoreButton: {
    backgroundColor: "#4caf50",
    borderRadius: "10px",
    margin: "20px",
    width: "150px",
    textAlign: "center",
    padding: "10px",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
