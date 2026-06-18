import { useState } from 'react';

export default function SongTable({ songs, params, loading }) {
  const [expandedSongId, setExpandedSongId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0);

  const toggleExpand = (id) => {
    setExpandedSongId(expandedSongId === id ? null : id);
  };

  const playSongTune = (audioProps, songId) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    let time = ctx.currentTime;
    const notes = audioProps?.melody || ['C5', 'E5', 'G5', 'C4'];
    
    setPlayingId(songId);
    setProgress(0);

    const startTime = Date.now();
    const duration = 1500;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / duration) * 100, 100);
      setProgress(percentage);
      if (elapsed >= duration) clearInterval(progressInterval);
    }, 30);

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

    setTimeout(() => {
      setPlayingId(null);
      setProgress(0);
    }, duration);
  };

  return (
    <div className="overflow-x-auto bg-base-100 rounded-xl shadow border">
      <table className="table table-zebra w-full text-sm">
        <thead>
          <tr>
            <th className="w-12 text-center">#</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Genre</th>
            <th className="text-center">Likes</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => {
            const isExpanded = expandedSongId === song.id;
            const globalIndex = (params.page - 1) * 20 + (index + 1);

            return (
              <caption key={song.id} className="contents">
                <tr 
                  className="cursor-pointer hover:bg-base-200 transition-colors"
                  onClick={() => toggleExpand(song.id)}
                >
                  <td className="text-center font-mono opacity-60">{globalIndex}</td>
                  <td className="font-semibold text-primary">{song.title}</td>
                  <td>{song.artist}</td>
                  <td>
                    <span className="badge badge-sm badge-outline opacity-80">{song.genre}</span>
                  </td>
                  <td className="text-center font-mono">❤️ {song.likes}</td>
                </tr>

                {isExpanded && (
                  <tr>
                    <td colSpan="5" className="bg-base-200/50 p-4 border-t border-b animate-fadeIn">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1 max-w-xl">
                            <p className="text-xs font-semibold opacity-50 uppercase tracking-wider">
                              Album: {song.albumTitle}
                            </p>
                            <p className="text-xs italic opacity-90 bg-base-100 p-2.5 rounded-lg border">
                              "{song.reviewText}"
                            </p>
                          </div>
                          <div className="flex sm:justify-end shrink-0 w-12 justify-center">
                            <button 
                              className="btn btn-circle btn-primary btn-sm shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                playSongTune(song.audioProps, song.id);
                              }}
                              disabled={playingId === song.id}
                            >
                              {playingId === song.id ? '🔊' : '▶️'}
                            </button>
                          </div>
                        </div>

                        {playingId === song.id && (
                          <div className="w-full space-y-1.5 pt-2 border-t border-base-300 animate-fadeIn">
                            <div className="flex items-end justify-between text-[10px] font-mono opacity-60 px-0.5">
                              <div className="flex items-end gap-0.5 h-3">
                                <div className="w-0.5 bg-primary rounded animate-[bounce_0.5s_infinite_100ms] h-2"></div>
                                <div className="w-0.5 bg-primary rounded animate-[bounce_0.5s_infinite_300ms] h-full"></div>
                                <div className="w-0.5 bg-primary rounded animate-[bounce_0.5s_infinite_200ms] h-3"></div>
                              </div>
                              <span>Playing Tones...</span>
                            </div>
                            <div className="w-full bg-base-300 h-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-primary h-full transition-all duration-30 ease-linear"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </caption>
            );
          })}
        </tbody>
      </table>

      {loading && (
        <div className="flex justify-center my-6">
          <span className="loading loading-dots loading-md text-primary"></span>
        </div>
      )}
    </div>
  );
}