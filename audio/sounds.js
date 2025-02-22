const sounds = {
  spawn: new Audio("audio/spawn.mp3"),
  clear: new Audio("audio/clear.mp3"),
  error: new Audio("audio/error.mp3"),
  gameOver: new Audio("audio/game-over.mp3"),
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
