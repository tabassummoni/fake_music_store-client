import { useState, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import SongTable from './components/SongTable'
import useSongs from './hook/useSongs'
import SongGallery from './components/SongGallery'
import './App.css'

function App() {
  const [params, setParams] = useState({
    locale: 'en',
    seed: '42',
    likes: 3.5,
    page: 1,
    viewMode: 'table'
  });

  // অডিও ট্র্যাকিং এবং প্রগ্রেসবার হ্যান্ডেল করার স্টেটসমূহ
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeAudio, setActiveAudio] = useState(null);
  const [audioLoadingId, setAudioLoadingId] = useState(null); // বড় গান লোড হওয়ার ট্র্যাক রাখার জন্য

  const { songs, loading, error } = useSongs(params);

  // 👇 অন-ডিমান্ড ৩ মিনিটের বড় গান ব্যাকএন্ড থেকে এনে প্লে করার গ্লোবাল ফাংশন
  const handlePlay = async (song) => {
    // গান অলরেডি বাজতে থাকলে পজ (Pause) হবে
    if (playingId === song.id) {
      if (activeAudio) activeAudio.pause();
      setPlayingId(null);
      setProgress(0);
      return;
    }

    // আগের কোনো গান বাজতে থাকলে তা বন্ধ করা
    if (activeAudio) {
      activeAudio.pause();
    }

    try {
      // স্পিনার দেখানোর জন্য এই গানের আইডিটি লোডিং স্টেটে সেট করা
      setAudioLoadingId(song.id);

      // ব্যাকএন্ডের নতুন এপিআই থেকে শুধু এই গানটির ৩ মিনিটের অডিও ফেচ করা
      const res = await fetch(`http://localhost:5005/api/songs/${song.songSeed}/audio`);
      if (!res.ok) throw new Error("Failed to fetch audio");
      const data = await res.json();
      
      // নতুন অডিও অবজেক্ট তৈরি
      const audio = new Audio(data.audioUrl);
      
      // প্রগ্রেস বার ট্র্যাক করার ইভেন্ট লিসেনার
      const updateProgress = () => {
        const percentage = (audio.currentTime / audio.duration) * 100;
        setProgress(isNaN(percentage) ? 0 : percentage);
      };
      audio.addEventListener('timeupdate', updateProgress);

      // গান শেষ হয়ে গেলে স্টেট রিসেট করা
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        setProgress(0);
      });

      audio.play()
        .then(() => {
          setActiveAudio(audio);
          setPlayingId(song.id);
          setAudioLoadingId(null); // লোডিং শেষ
        })
        .catch(err => {
          console.error("Playback failed:", err);
          setAudioLoadingId(null);
        });

    } catch (err) {
      console.error("Big audio play failed:", err);
      setAudioLoadingId(null);
      alert("Could not load the big audio track. Please check if backend is running.");
    }
  };

  // ভিউ মোড চেঞ্জ হলে বা অন্য পেজে গেলে রানিং অডিও বন্ধ করার সেফটি চেক
  useEffect(() => {
    return () => {
      if (activeAudio) {
        activeAudio.pause();
      }
    };
  }, [activeAudio, params.viewMode, params.page]);

  return (
    <div className="container mx-auto p-4 max-w-6xl min-h-screen">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">🎵 FAKE MUSIC STORE</h1>
        </div>

        <div className="tabs tabs-boxed shadow-sm">
          <button
            className={`tab ${params.viewMode === 'table' ? 'tab-active' : ''}`}
            onClick={() => setParams(prev => ({ ...prev, viewMode: 'table', page: 1 }))}
          >
            📋 Table View
          </button>
          <button
            className={`tab ${params.viewMode === 'gallery' ? 'tab-active' : ''}`}
            onClick={() => setParams(prev => ({ ...prev, viewMode: 'gallery', page: 1 }))}
          >
            🖼️ Gallery View
          </button>
        </div>
      </header>

      <Toolbar params={params} setParams={setParams} />

      {error && (
        <div className="alert alert-error shadow-sm mb-6">
          <span>{error}. Please check if backend server is running on port 5005.</span>
        </div>
      )}

      <div className="bg-base-100 p-4 sm:p-6 rounded-xl shadow-sm border relative min-h-100">
        {loading && params.page === 1 ? (
          <div className="absolute inset-0 bg-base-100/50 flex justify-center items-center z-10 rounded-xl">
            <span className="loading loading-ring loading-lg text-primary"></span>
          </div>
        ) : null}

        {/* টেবিল এবং গ্যালারি দুটিতেই সব প্রপস ও নতুন অডিওলোডিং আইডি পাস করা হয়েছে */}
        {params.viewMode === 'table' ? (
          <SongTable
            songs={songs}
            params={params}
            loading={loading}
            playingId={playingId}
            progress={progress}
            onPlay={handlePlay}
            audioLoadingId={audioLoadingId}
          />
        ) : (
          <SongGallery
            songs={songs}
            params={params}
            setParams={setParams}
            loading={loading}
            playingId={playingId}
            progress={progress}
            onPlay={handlePlay}
            audioLoadingId={audioLoadingId}
          />
        )}
        
        {params.viewMode === 'table' && (
          <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-base-200">
            <button 
              className="btn btn-sm btn-outline"
              disabled={params.page <= 1 || loading}
              onClick={() => setParams(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              ◀️ Previous
            </button>
            <span className="font-mono text-sm font-bold bg-base-200 px-3 py-1 rounded-md">
              Page {params.page}
            </span>
            <button 
              className="btn btn-sm btn-outline"
              disabled={loading || songs.length < 20}
              onClick={() => setParams(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next ▶️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App