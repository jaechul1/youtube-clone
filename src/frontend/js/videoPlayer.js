const video = document.querySelector("video"),
  playBtn = document.getElementById("play"),
  playBtnIcon = playBtn.querySelector("i"),
  muteBtn = document.getElementById("mute"),
  muteBtnIcon = muteBtn.querySelector("i"),
  fullscreenBtn = document.getElementById("fullscreen"),
  fullscreenBtnIcon = fullscreenBtn.querySelector("i"),
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
    ? (video.play(), (playBtnIcon.classList = "fas fa-pause"))
    : (video.pause(), (playBtnIcon.classList = "fas fa-play"));
});

muteBtn.addEventListener("click", () => {
  video.muted
    ? ((video.muted = false),
      (muteBtnIcon.classList = "fas fa-volume-up"),
      (volumeRange.value = volumeValue))
    : ((video.muted = true),
      (muteBtnIcon.classList = "fas fa-volume-mute"),
      (volumeRange.value = 0));
});

fullscreenBtn.addEventListener("click", () => {
  document.fullscreenElement
    ? (document.exitFullscreen(),
      (fullscreenBtnIcon.classList = "fas fa-expand"))
    : (videoContainer.requestFullscreen(),
      (fullscreenBtnIcon.classList = "fas fa-compress"));
});

volumeRange.addEventListener("input", (event) => {
  const value = event.target.value;
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-up";
  }
  if (value >= 0.5) {
    muteBtnIcon.classList = "fas fa-volume-up";
  } else if (value == event.target.min) {
    video.muted = true;
    muteBtnIcon.classList = "fas fa-volume-mute";
  } else {
    muteBtnIcon.classList = "fas fa-volume-down";
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

video.addEventListener("ended", () => {
  fetch(`/api/videos/${video.dataset.id}/view`, {
    method: "POST",
  });
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
