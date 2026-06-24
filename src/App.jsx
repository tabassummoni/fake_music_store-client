export function stopPreview(audioRef) {
  if (audioRef.current) {
    if (audioRef.current._handleTimeUpdate) {
      audioRef.current.removeEventListener('timeupdate', audioRef.current._handleTimeUpdate);
    }
    if (audioRef.current._handleEnded) {
      audioRef.current.removeEventListener('ended', audioRef.current._handleEnded);
    }
    audioRef.current.pause();
    audioRef.current = null;
  }
}

export function playSongPreview(seed, songId, setPlayingId, setProgress, audioRef, onError) {
  stopPreview(audioRef);

  const audio = new Audio(`https://fake-music-store-server-4.onrender.com/api/songs/play/${seed}`);
  audioRef.current = audio;

  audio._handleTimeUpdate = () => {
    if (audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  audio._handleEnded = () => {
    setPlayingId(null);
    setProgress(0);
  };

  audio.addEventListener('timeupdate', audio._handleTimeUpdate);
  audio.addEventListener('ended', audio._handleEnded);

  audio.play()
    .then(() => {
      setPlayingId(songId);
    })
    .catch(err => {
      console.error("Error playing audio:", err);
      if (onError) {
        onError("Audio preview could not be played.");
      }
      setPlayingId(null);
    });
}