import { useEffect } from 'react';

const playSongTune = (audioProps) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  let time = ctx.currentTime;

  const notes = audioProps?.melody || ['C5', 'E5', 'G5', 'C4'];
  
  notes.slice(0, 4).forEach((note, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const freqs = { 'C4': 261.63, 'G4': 392.00, 'Am4': 440.00, 'F4': 349.23, 'C5': 523.25, 'E5': 659.25, 'G5': 783.99 };
    osc.frequency.value = freqs[note] || 440 + (index * 100);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.5);
    time += 0.3;
  });
};

export default function SongGallery({ songs, params, setParams, loading }) {
  
  useEffect(() => {
    if (params.viewMode !== 'gallery') return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 100 && !loading
      ) {
        setParams(prev => ({ ...prev, page: prev.page + 1 }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, params.viewMode, setParams]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {songs.map((song) => (
          <div 
            key={song.id} 
            className="card bg-base-100 shadow-xl border hover:shadow-2xl transition-all duration-300 group overflow-hidden"
          >
            <div 
              className="h-48 flex flex-col justify-between p-4 text-white font-black relative overflow-hidden shrink-0"
              style={{ background: song.coverProps?.bgGradient || 'linear-gradient(45deg, #1e3a8a, #3b82f6)' }}
            >
              <div 
                className="absolute inset-0 opacity-20 transition-transform group-hover:scale-110 duration-500"
                style={{ 
                  backgroundColor: song.coverProps?.patternColor || 'rgba(255,255,255,0.2)', 
                  filter: `blur(${song.coverProps?.blurAmount || 0}px)` 
                }}
              />
              <span className="text-xs uppercase tracking-widest opacity-75 z-10">{song.genre}</span>
              
              <button 
                className="btn btn-circle btn-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-20 text-lg"
                onClick={() => playSongTune(song.audioProps)}
              >
                ▶️
              </button>
              
              <span className="text-right text-xs font-mono z-10">❤️ {song.likes}</span>
            </div>

            <div className="card-body p-4 space-y-1">
              <h2 className="card-title text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
                {song.title}
              </h2>
              <p className="text-sm opacity-70 line-clamp-1">by {song.artist}</p>
              <div className="text-[11px] opacity-50 italic">
                Album: {song.albumTitle}
              </div>
              <p className="text-xs line-clamp-2 bg-base-200 p-2 rounded mt-2 opacity-80">
                "{song.reviewText}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <span className="loading loading-dots loading-lg text-secondary"></span>
        </div>
      )}
    </div>
  );
}