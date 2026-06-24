import React, { useState, useEffect } from 'react';

export default function SongTable({ songs, params, playingId, progress, onPlay, audioLoadingId }) {
  const [expandedSongId, setExpandedSongId] = useState(null);
  
  const toggleExpand = (id) => {
    setExpandedSongId(expandedSongId === id ? null : id);
  };

  const drawCover = (canvasId, title, artist, coverProps) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !coverProps) return;
    const ctx = canvas.getContext('2d');

    // ক্যানভাস ক্লিয়ার করা (ওভারল্যাপিং এড়ানোর জন্য)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const h1 = coverProps.hue1 ?? 200; 
    const h2 = coverProps.hue2 ?? 240; 
    grad.addColorStop(0, `hsl(${h1}, 75%, 45%)`);
    grad.addColorStop(1, `hsl(${h2}, 85%, 15%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = `rgba(255, 255, 255, 0.12)`;
    ctx.beginPath();
    if (coverProps.shapeType === 'circle') {
      ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    } else {
      ctx.rect(35, 35, canvas.width - 70, canvas.height - 70);
    }
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(title.substring(0, 18), 12, canvas.height - 35);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '10px sans-serif';
    ctx.fillText(artist.substring(0, 22), 12, canvas.height - 18);
  };

  useEffect(() => {
    if (expandedSongId) {
      const targetSong = songs.find(s => s.id === expandedSongId);
      if (targetSong) {
        const timer = setTimeout(() => {
          const props = targetSong.coverProps || {
            hue1: Math.abs(targetSong.songSeed) % 360,
            hue2: (Math.abs(targetSong.songSeed) + 120) % 360,
            shapeType: Math.abs(targetSong.songSeed) % 2 === 0 ? 'circle' : 'square'
          };
          drawCover(`canvas-${targetSong.id}`, targetSong.title, targetSong.artist, props);
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [expandedSongId, songs]);

  return (
    <div className="overflow-x-auto bg-base-100 rounded-xl shadow border border-base-200">
      <table className="table w-full text-sm border-collapse">
        <thead>
          <tr className="bg-base-200/50">
            <th className="w-16 pl-4 py-3 text-left">#</th>
            <th className="py-3 text-left">Title</th>
            <th className="py-3 text-left">Artist</th>
            <th className="py-3 text-left">Genre</th>
            <th className="pr-4 py-3 text-left">Likes</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => {
            const isExpanded = expandedSongId === song.id;
            const globalIndex = (params.page - 1) * 20 + (index + 1);
            const isLoadingThis = audioLoadingId === song.id;

            return (
              <React.Fragment key={song.id}>
                <tr 
                  className="cursor-pointer hover:bg-base-200/60 transition-colors border-b border-base-200"
                  onClick={() => toggleExpand(song.id)}
                >
                  <td className="font-mono opacity-60 pl-4 py-3.5 text-left">{globalIndex}</td>
                  <td className="font-bold text-primary py-3.5 text-left">{song.title}</td>
                  <td className="text-base-content/80 py-3.5 text-left">{song.artist}</td>
                  <td className="py-3.5 text-left">
                    <span className="badge badge-sm badge-outline opacity-80">{song.genre}</span>
                  </td>
                  <td className="font-mono pr-4 py-3.5 text-left">❤️ {song.likes}</td>
                </tr>

                {isExpanded && (
                  <tr>
                    <td colSpan="5" className="bg-base-200/40 p-5 border-b border-base-200 text-left">
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="w-36 h-36 bg-base-300 rounded-lg shadow overflow-hidden shrink-0">
                          <canvas id={`canvas-${song.id}`} width="150" height="150" className="w-full h-full"></canvas>
                        </div>

                        <div className="flex-1 space-y-3 text-left">                          
                          <h4 className="font-bold text-base text-base-content">{song.title}</h4>
                          <p className="text-sm text-base-content/80 -mt-2">{song.artist}</p>
                          
                          <div className="flex items-center gap-4 w-full">
                            <button
                              className={`btn btn-circle btn-primary btn-sm shadow-md shrink-0 ${isLoadingThis ? 'loading' : ''}`}
                              disabled={isLoadingThis}
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlay(song);
                              }}
                            >
                              {isLoadingThis ? '' : (playingId === song.id ? '⏸️' : '▶️')}
                            </button>
                            
                            {playingId === song.id && (
                              <div className="flex-1 bg-base-300 rounded-full h-1.5 overflow-hidden max-w-xs">
                                <div className="bg-primary h-1.5 rounded-full transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                              </div>
                            )}
                          </div>

                          <p className="text-xs italic bg-base-100 p-3 rounded-lg border border-base-200 text-left text-base-content/80 shadow-inner">
                            "{song.reviewText}"
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}