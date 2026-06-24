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

  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeAudio, setActiveAudio] = useState(null);
  const [audioLoadingId, setAudioLoadingId] = useState(null);

  const { songs, loading, error } = useSongs(params);

  const getAudioUrl = (songSeed) => {
    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const baseUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    return `${baseUrl}/songs/play/${songSeed}`;
  };

  const handlePlay = async (song) => {
    if (playingId === song.id) {
      if (activeAudio) activeAudio.pause();
      setPlayingId(null);
      setProgress(0);
      return;
    }

    if (activeAudio) {
      activeAudio.pause();
    }

    try {
      setAudioLoadingId(song.id);

      const audioUrl = getAudioUrl(song.songSeed);
      
      const audio = new Audio(audioUrl);
      
      const updateProgress = () => {
        const percentage = (audio.currentTime / audio.duration) * 100;
        setProgress(isNaN(percentage) ? 0 : percentage);
      };
      audio.addEventListener('timeupdate', updateProgress);

      audio.addEventListener('ended', () => {
        setPlayingId(null);
        setProgress(0);
      });

      audio.play()
        .then(() => {
          setActiveAudio(audio);
          setPlayingId(song.id);
          setAudioLoadingId(null);
        })
        .catch(err => {
          console.error("Playback failed:", err);
          setAudioLoadingId(null);
        });

    } catch (err) {
      console.error("Audio load failed:", err);
      setAudioLoadingId(null);
    }
  };

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
        <div className="alert alert-error shadow-sm mb-6 text-left">
          <span>{error}. Please check if backend server is running correctly.</span>
        </div>
      )}

      <div className="bg-base-100 p-4 sm:p-6 rounded-xl shadow-sm border relative min-h-100">
        {loading && params.page === 1 ? (
          <div className="absolute inset-0 bg-base-100/50 flex justify-center items-center z-10 rounded-xl">
            <span className="loading loading-ring loading-lg text-primary"></span>
          </div>
        ) : null}

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

export default App;