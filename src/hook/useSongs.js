import { useState, useEffect } from 'react';

export default function useSongs(params) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://fake-music-store-server.onrender.com/api';
        const query = new URLSearchParams({
          locale: params.locale,
          seed: params.seed,
          likes: params.likes,
          page: params.page
        }).toString();

        const fetchUrl = `${baseUrl}/songs?${query}`;
        console.log("Fetching data from:", fetchUrl);

        const response = await fetch(fetchUrl);
        const result = await response.json();

    if (result.success) {
      if (params.viewMode === 'gallery' && params.page > 1) {
        setSongs(prev => [...prev, ...result.data]);
      } else {
        setSongs(result.data);
      }
    } else {
      setError("Failed to generate data");
    }
  } catch (err) {
    console.error("useSongs fetch error:", err);
    setError("Server connection error. Please ensure backend is running.");
  } finally {
    setLoading(false);
  }
};

    fetchSongs();
  }, [params.locale, params.seed, params.likes, params.page, params.viewMode]);

  return { songs, loading, error, setSongs };
}