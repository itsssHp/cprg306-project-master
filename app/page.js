"use client";

import Link from "next/link";
import MovieSearch from "./src/components/movie-search";

export default function Page() {
  return (
    <main style={styles.container}>
      <div style={styles.headerContainer}>
        <h1 style={styles.header}>Film Finder</h1>

        <div style={styles.divContainer}>
          <Link href="./src/login/">Login</Link>
        </div>
      </div>

      <div>
        <MovieSearch />
      </div>
    </main>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: "20px",
    backgroundColor: "#1c1917",
    minHeight: "100vh",
    margin: 0,
  },
  divContainer: {
    backgroundColor: "#ea580c",
    borderRadius: "10px",
    marginBottom: "20px",
    width: "100px",
    textAlign: "center",
    padding: "10px",
    boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.6)",
  },
  welcomeMessage: {
    color: "white",
    fontSize: "24px",
    marginBottom: "20px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    fontSize: "30px",
    fontWeight: "bold",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
    margin: "20px",
    width: "90%",
    borderWidth: "3px",
    backgroundColor: "#1e1b4b",
    borderRadius: "20px",
    boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.6)",
  },
  welcomeMessage: {
    color: "white",
    fontSize: "24px",
    marginBottom: "20px",
  },
};
