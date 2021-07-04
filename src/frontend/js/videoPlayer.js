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
  videoControls = document.getElementById("videoControls"),
  blackBackground = document.getElementById("blackBackground"),
  addComments = document.getElementById("addComments");

let controlsTimeout = null;
let volumeStore = 0.5;
const inputEventStore = new Event("input");
video.volume = volumeStore;

const togglePlay = () => {
  video.paused
    ? (video.play(), (playBtnIcon.classList = "fas fa-pause"))
    : (video.pause(), (playBtnIcon.classList = "fas fa-play"));
};

const toggleMute = () => {
  video.muted
    ? ((video.muted = false),
      volumeStore >= 0.4
        ? (muteBtnIcon.classList = "fas fa-volume-up")
        : (muteBtnIcon.classList = "fas fa-volume-down"),
      (volumeRange.value = volumeStore))
    : ((video.muted = true),
      (muteBtnIcon.classList = "fas fa-volume-mute"),
      (volumeRange.value = 0));
};

const toggleFullscreen = () => {
  document.fullscreenElement
    ? (document.exitFullscreen(),
      (fullscreenBtnIcon.classList = "fas fa-expand"))
    : (videoContainer.requestFullscreen(),
      (fullscreenBtnIcon.classList = "fas fa-compress"));
};

playBtn.addEventListener("mousedown", togglePlay);
muteBtn.addEventListener("mousedown", toggleMute);
fullscreenBtn.addEventListener("mousedown", toggleFullscreen);

const changeVolume = (event) => {
  const currentVolume = event.target.value;
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-up";
  }
  if (currentVolume >= 0.4) {
    muteBtnIcon.classList = "fas fa-volume-up";
  } else if (currentVolume == 0) {
    video.muted = true;
    muteBtnIcon.classList = "fas fa-volume-mute";
  } else {
    muteBtnIcon.classList = "fas fa-volume-down";
  }
  video.volume = currentVolume;
  volumeStore = currentVolume;
};

const changeTimeline = (event) => {
  video.currentTime = event.target.value;
};

volumeRange.addEventListener("input", changeVolume);
timeline.addEventListener("input", changeTimeline);

const formatTime = (seconds) => {
  /* formatTime(71) = "1:11", formatTime(671) = "11:11" */
  const formatted = new Date(seconds * 1000).toISOString().substr(14, 5);
  return formatted.startsWith("0") ? formatted.substr(1) : formatted;
};

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
  playBtnIcon.classList = "fas fa-play";
  fetch(`/api/videos/${video.dataset.id}/view`, {
    method: "POST",
  });
});

video.addEventListener("mousedown", togglePlay);

const showControls = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  videoControls.classList.add("showing");
  blackBackground.classList.add("showing");
  controlsTimeout = setTimeout(() => {
    videoControls.classList.remove("showing");
    blackBackground.classList.remove("showing");
  }, 3000);
};

videoContainer.addEventListener("mousemove", showControls);

videoContainer.addEventListener("mouseleave", () => {
  videoControls.classList.remove("showing");
  blackBackground.classList.remove("showing");
});

window.addEventListener("keydown", (event) => {
  // check whether user is not in a comment section
  if (String(event.target.type) !== "text") {
    switch (event.code) {
      case "Space":
        event.preventDefault();
        showControls();
        togglePlay();
        break;
      case "KeyM":
        showControls();
        toggleMute();
        break;
      case "KeyF":
        showControls();
        toggleFullscreen();
        break;
      case "ArrowLeft":
        event.preventDefault();
        showControls();
        timeline.value -= 5;
        timeline.dispatchEvent(inputEventStore);
        break;
      case "ArrowDown":
        event.preventDefault();
        showControls();
        volumeRange.value -= 0.05;
        volumeRange.dispatchEvent(inputEventStore);
        break;
    }
  }
});
