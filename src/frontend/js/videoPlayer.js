const video = document.querySelector("video"),
  playBtn = document.getElementById("play"),
  muteBtn = document.getElementById("mute"),
  fullscreenBtn = document.getElementById("fullscreen"),
  volumeRange = document.getElementById("volume"),
  currentTime = document.getElementById("currentTime"),
  totalTime = document.getElementById("totalTime"),
  timeline = document.getElementById("timeline"),
  videoContainer = document.getElementById("videoContainer"),
  videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const formatTime = (seconds) => {
  const formatted = new Date(seconds * 1000).toISOString().substr(14, 5);
  return formatted.startsWith("0") ? formatted.substr(1) : formatted;
};

playBtn.addEventListener("click", () => {
  video.paused
    ? (video.play(), (playBtn.innerText = "Pause"))
    : (video.pause(), (playBtn.innerText = "Play"));
});

muteBtn.addEventListener("click", () => {
  video.muted
    ? ((video.muted = false),
      (muteBtn.innerText = "Mute"),
      (volumeRange.value = volumeValue))
    : ((video.muted = true),
      (muteBtn.innerText = "Unmute"),
      (volumeRange.value = 0));
});

fullscreenBtn.addEventListener("click", () => {
  document.fullscreenElement
    ? (document.exitFullscreen(),
      (fullscreenBtn.innerText = "Enter Fullscreen"))
    : (videoContainer.requestFullscreen(),
      (fullscreenBtn.innerText = "Exit Fullscreen"));
});

volumeRange.addEventListener("input", (event) => {
  const value = event.target.value;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
});

timeline.addEventListener("input", (event) => {
  video.currentTime = event.target.value;
});

video.addEventListener("loadedmetadata", () => {
  const duration = Math.floor(video.duration);
  totalTime.innerText = formatTime(duration);
  timeline.max = duration;
});

video.addEventListener("timeupdate", () => {
  const current = Math.floor(video.currentTime);
  currentTime.innerText = formatTime(current);
  timeline.value = current;
});

videoContainer.addEventListener("mousemove", () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsTimeout = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 3000);
});

videoContainer.addEventListener("mouseleave", () => {
  videoControls.classList.remove("showing");
});
