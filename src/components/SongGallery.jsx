import React, { useState, useEffect, useRef, useCallback } from 'react';

// Custom hook to detect when an element is visible
function useIsVisible(ref) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntersecting(true);
        observer.unobserve(entry.target); // Stop observing once visible
      }
    });

    // Capture the current ref value inside the effect
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
}

export default function SongGallery({ songs, setParams, loading, playingId, progress, onPlay }) {
  const drawGalleryCover = useCallback((canvasId, title, artist, coverProps) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !coverProps) return;
    const ctx = canvas.getContext('2d');

    // ক্যানভাস ক্লিয়ার করা (ওভারল্যাপিং এড়ানোর জন্য)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ব্যাকগ্রাউন্ড গ্রাডিয়েন্ট রেন্ডার
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, `hsl(${coverProps.hue1 || 210}, 75%, 45%)`);
    grad.addColorStop(1, `hsl(${coverProps.hue2 || 240}, 85%, 15%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // র্যান্ডম শেইপ বা জ্যামিতিক প্যাটার্ন রেন্ডার (রিকোয়ারমেন্ট ফুলফিলমেন্ট)
    ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
    ctx.beginPath();
    if (coverProps.shapeType === 'circle') {
      ctx.arc(canvas.width / 2, canvas.height / 2, 65, 0, Math.PI * 2);
    } else {
      ctx.rect(40, 40, canvas.width - 80, canvas.height - 80);
    }
    ctx.fill();

    // কভারের ওপর টাইটেল রেন্ডার (বাস্তব অ্যালবাম লুক)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(title.substring(0, 18), 16, canvas.height - 45);
    
    // কভারের ওপর আর্টিস্টের নাম রেন্ডার
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px sans-serif';
    ctx.fillText(artist.substring(0, 22), 16, canvas.height - 22);
  }, []);

  // Infinite scroll observer
  const observer = useRef();
  const lastSongElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setParams(prev => ({ ...prev, page: prev.page + 1 }));
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, setParams]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {songs.map((song, index) => {
          const isLastElement = songs.length === index + 1;
          return (
            <SongCard
              key={song.id}
              song={song}
              ref={isLastElement ? lastSongElementRef : null}
              playingId={playingId}
              progress={progress}
              onPlay={onPlay}
              drawCover={drawGalleryCover}
            />
          );
        })}
      </div>
    </div>
  );
}

const SongCard = React.forwardRef(({ song, playingId, progress, onPlay, drawCover }, ref) => {
  const cardRef = useRef();
  const isVisible = useIsVisible(cardRef);

  useEffect(() => {
    if (isVisible) {
      // ডেটা যদি coverProps অবজেক্টের সরাসরি মেম্বার না হয়ে সরাসরি song-এর ভেতর থাকে, তার জন্য সেফটি হ্যান্ডলিং
      const props = song.coverProps || {
        hue1: Math.abs(song.songSeed) % 360,
        hue2: (Math.abs(song.songSeed) + 120) % 360,
        shapeType: Math.abs(song.songSeed) % 2 === 0 ? 'circle' : 'square'
      };
      drawCover(`gallery-canvas-${song.id}`, song.title, song.artist, props);
    }
  }, [isVisible, song, drawCover]);

  return (
    <div ref={ref || cardRef} className="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <div className="h-48 relative overflow-hidden shrink-0 bg-base-300">
        <canvas id={`gallery-canvas-${song.id}`} width="250" height="200" className="w-full h-full object-cover"></canvas>
        
        <button 
          className={`btn btn-circle btn-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg transition-opacity duration-300 ${playingId === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={() => onPlay(song)}
        >
          {playingId === song.id ? '⏸️' : '▶️'}
        </button>
        <span className="absolute top-3 right-3 font-mono text-xs bg-black/40 text-white px-2 py-0.5 rounded-full">❤️ {song.likes}</span>
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-md font-bold">{song.genre}</span>
        
        {playingId === song.id && (
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/30">
            <div className="bg-primary h-full transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      <div className="card-body p-4 space-y-1 text-left">
        <h2 className="card-title text-base font-bold line-clamp-1 text-left">{song.title}</h2>
        <p className="text-sm opacity-70 text-left">by {song.artist}</p>
        <div className="text-[11px] opacity-50 italic text-left">Format: {song.albumTitle}</div>
        <p className="text-xs line-clamp-2 bg-base-200 p-2 rounded mt-2 text-left opacity-80">"{song.reviewText}"</p>
      </div>
    </div>
  );
});

SongCard.displayName = 'SongCard';