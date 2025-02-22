const sounds = {
  tap: new Audio("/piano-typing-game/audio/tap.mp3"),
  error: new Audio("/piano-typing-game/audio/err.mp3"),
  gameOver: new Audio("/piano-typing-game/audio/end.mp3"),
};

function playSound(soundName) {
  if (sounds[soundName]) {
    sounds[soundName].currentTime = 0;
    sounds[soundName].play().catch((error) => {
      console.log("音频播放失败:", error);
    });
  }
}

export { playSound };
