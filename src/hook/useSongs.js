import { useState, useEffect } from 'react';

export default function useSongs(params) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSongs = async () => {
      setLoading(true);
      try {
        const baseUrl = "https://fake-music-store-server-4.onrender.com/api";
        const url = `${baseUrl}/songs?locale=${params.locale}&seed=${params.seed}&page=${params.page}&likes=${params.likes}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch data from API');
        
        const responseData = await res.json();
        
        if (isMounted) {
          const incomingSongs = Array.isArray(responseData) 
            ? responseData 
            : (responseData.data || responseData.songs || []);

          if (params.viewMode === 'gallery' && params.page > 1) {
            setSongs(prev => [...prev, ...incomingSongs]);
          } else {
            setSongs(incomingSongs);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Fetch error details:", err);
          setError('Failed to fetch');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSongs();
    
    return () => { 
      isMounted = false; 
    };
  }, [params.locale, params.seed, params.likes, params.page, params.viewMode]);

  return { songs, loading, error };
}