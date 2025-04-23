export default async function handler(req, res) {
  const { query, page } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is missing" });
  }

  const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${
    process.env.TMDB_API_KEY
  }&query=${encodeURIComponent(query)}&page=${encodeURIComponent(page || 1)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch data from TMDb");
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching movie data" });
  }
}
