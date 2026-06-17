import React, { useState } from 'react';

export default function SongTable({ songs, params, setParams, loading }) {

    const [expandedSongId, setExpandedSongId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedSongId(expandedSongId === id ? null : id);
    };
    const playSongTune = (audioProps) => {
        if (!audioProps) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        let time = ctx.currentTime;

        const notes = audioProps.melody || ['C5', 'E5', 'G5'];

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
    return (
        <div className="overflow-x-auto w-full">
            <table className="table table-zebra w-full shadow-sm rounded-lg overflow-hidden">
                {/* table header */}
                <thead className="bg-base-300 text-base-content">
                    <tr>
                        <th>#</th>
                        <th>Song</th>
                        <th>Artist</th>
                        <th>Album</th>
                        <th>Genre</th>
                        <th>Likes</th>
                    </tr>
                </thead>

                {/* table body */}
                <tbody>
                    {songs.map((song) => (
                        <React.Fragment key={song.id}>
                            {/* main row (click to expand) */}
                            <tr
                                className={`hover:bg-primary/10 cursor-pointer transition-colors ${expandedSongId === song.id ? 'bg-primary/5 font-medium' : ''}`}
                                onClick={() => toggleExpand(song.id)}
                            >
                                <td>{song.sequenceIndex}</td>
                                <td className="text-primary font-bold">{song.title}</td>
                                <td>{song.artist}</td>
                                <td className={song.albumTitle === "Single" ? "opacity-50 italic" : ""}>
                                    {song.albumTitle}
                                </td>
                                <td><span className="badge badge-outline badge-sm">{song.genre}</span></td>
                                <td className="font-mono text-secondary">❤️ {song.likes}</td>
                            </tr>

                            {/* 🎯 expandable row (like the teacher's image for the cover and details) */}
                            {expandedSongId === song.id && (
                                <tr className="bg-base-200/50 animation-fadeIn">
                                    <td colSpan="6" className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6 items-start bg-base-100 p-4 rounded-xl border shadow-inner">

                                            {/* album cover art (with dynamic design using background gradient) */}
                                            <div
                                                className="w-36 h-36 rounded-lg shadow-lg flex flex-col justify-between p-3 text-white font-black text-center relative overflow-hidden shrink-0"
                                                style={{ background: song.coverProps?.bgGradient ?? 'transparent' }}
                                            >
                                                {/* cover pattern */}
                                                <div
                                                    className={`absolute inset-0 opacity-20 ${song.coverProps?.patternType === 'circle' ? 'rounded-full scale-110' : 'clip-path-polygon'}`}
                                                    style={{ backgroundColor: song.coverProps?.patternColor ?? 'transparent', filter: `blur(${song.coverProps?.blurAmount ?? 0}px)` }}
                                                />
                                                <span className="text-xs tracking-widest uppercase opacity-75 z-10">Album</span>
                                                <h3 className="text-sm font-extrabold leading-tight drop-shadow-md line-clamp-2 my-auto z-10 uppercase">{song.title}</h3>
                                                <p className="text-[10px] font-medium opacity-90 truncate z-10">{song.artist}</p>
                                            </div>

                                            {/* song information and play button */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-xl font-black">{song.title}</h2>
                                                    {/* play button (to be connected to Tone.js music in the next step) */}
                                                    <button
                                                        className="btn btn-circle btn-primary btn-sm shadow-md"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playSongTune(song.audioProps);
                                                        }}
                                                    >
                                                        ▶️
                                                    </button>
                                                </div>

                                                <p className="text-sm opacity-70">
                                                    from <span className="font-bold text-base-content">{song.albumTitle}</span> by <span className="font-bold text-primary">{song.artist}</span>
                                                </p>

                                                <div className="divider my-1"></div>

                                                {/* generated review text */}
                                                <div>
                                                    <h4 className="text-xs uppercase font-bold tracking-wider opacity-50 mb-1">Review</h4>
                                                    <p className="text-sm italic opacity-80 bg-base-200 p-3 rounded-lg border-l-4 border-secondary">
                                                        "{song.reviewText}"
                                                    </p>
                                                </div>
                                            </div>

                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {/* table view pagination controls */}
            {params.viewMode === 'table' && (
                <div className="flex justify-center mt-6">
                    <div className="join border shadow-sm">

                        {/* Previous button: If on page 1, clicking Previous will go to the last page (e.g., page 5) */}
                        <button
                            className="join-item btn btn-sm"
                            disabled={loading}
                            onClick={() => setParams(prev => ({
                                ...prev,
                                page: prev.page === 1 ? 5 : prev.page - 1
                            }))}
                        >
                            « Previous
                        </button>

                        <button className="join-item btn btn-sm btn-active font-mono bg-primary text-primary-content">
                            Page {params.page}
                        </button>

                        {/* Next button */}
                        <button
                            className="join-item btn btn-sm"
                            disabled={loading}
                            onClick={() => setParams(prev => ({
                                ...prev,
                                page: prev.page === 5 ? 1 : prev.page + 1
                            }))}
                        >
                            Next »
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}