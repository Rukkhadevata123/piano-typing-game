const sounds = {
  tap: new Audio("../audio/tap.mp3"),
  error: new Audio("../audio/err.mp3"),
  gameOver: new Audio("../audio/end.mp3"),
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
