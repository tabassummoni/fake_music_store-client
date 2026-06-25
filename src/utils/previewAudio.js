export function stopPreview(audioRef) {
  if (audioRef.current) {
    // Remove event listeners to prevent memory leaks and unexpected behavior
    audioRef.current.removeEventListener('timeupdate', audioRef.current._handleTimeUpdate);
    audioRef.current.removeEventListener('ended', audioRef.current._handleEnded);

    audioRef.current.pause();
    audioRef.current = null; // Dereference the audio object
  }
}

export function playSongPreview(seed, songId, setPlayingId, setProgress, audioRef, onError) {
  stopPreview(audioRef);

  const audio = new Audio(`https://fake-music-store-server-4.onrender.com/api/songs/play/${seed}`);
  audioRef.current = audio;

  audio.play()
    .then(() => {
      setPlayingId(songId);
    })
    .catch(err => {
      console.error("Error playing audio:", err);
      if (onError) {
        onError("Audio preview could not be played. The file may be corrupt or unsupported.");
      }
      setPlayingId(null);
    });

  // Store handlers on the audio object so they can be removed later
  audio._handleTimeUpdate = () => {
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  audio._handleEnded = () => {
    setPlayingId(null);
    setProgress(0);
  };

  audio.addEventListener('timeupdate', audio._handleTimeUpdate);
  audio.addEventListener('ended', audio._handleEnded);
}