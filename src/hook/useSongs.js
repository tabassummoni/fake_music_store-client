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
        const url = `http://localhost:5005/api/songs?locale=${params.locale}&seed=${params.seed}&page=${params.page}&likes=${params.likes}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch data from API');
        
        const responseData = await res.json();
        
        if (isMounted) {
          // ব্যাকএন্ড অ্যারে পাঠাক বা অবজেক্ট, ডেটা সেফলি পার্স করা
          const incomingSongs = Array.isArray(responseData) 
            ? responseData 
            : (responseData.data || responseData.songs || []);

          if (params.viewMode === 'gallery' && params.page > 1) {
            // গ্যালারিতে স্ক্রোল করলে নতুন গানগুলো আগের গানের নিচে জমা হবে
            setSongs(prev => [...prev, ...incomingSongs]);
          } else {
            // টেবিল ভিউ অথবা প্রথম পেজের জন্য ডেটা সরাসরি সেট হবে
            // (এটি অ্যাসিনক্রোনাসলি ডেটা আসার পর চলায় কোনো রেন্ডার লুপ তৈরি করবে না)
            setSongs(incomingSongs);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
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