import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const video = document.getElementById("preview");
const recordBtn = document.getElementById("record");
const downloadBtn = document.getElementById("download");
const videoMessageBox = document.getElementById("videoMessageBox");
const videoMessage = videoMessageBox.querySelector("span");

let recorder, recorded;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileURL, fileName) => {
  const a = document.createElement("a");
  a.download = fileName;
  a.href = fileURL;
  document.body.appendChild(a);
  a.click();
};

const wait = (time) => new Promise((f) => setTimeout(f, time));

const recordStart = () => {
  recordBtn.innerText = "Pause";
  recorder.start();
  downloadBtn.disabled = false;
};

const recordPause = () => {
  recordBtn.innerText = "Resume";
  recorder.pause();
};

const recordResume = () => {
  recordBtn.innerText = "Pause";
  recorder.resume();
};

const downloadRecord = async () => {
  recordBtn.disabled = true;
  downloadBtn.disabled = true;
  recordBtn.innerText = "Transcoding";
  recorder.stop();

  while (!recorded) {
    await wait(500);
  }

  const { mp4URL, thumbURL } = await transcodeRecord();

  downloadFile(mp4URL, "My Recording.mp4");
  downloadFile(thumbURL, "My Thumbnail.jpg");

  URL.revokeObjectURL(recorded);
  URL.revokeObjectURL(mp4URL);
  URL.revokeObjectURL(thumbURL);

  recordBtn.innerText = "Start";
  recordBtn.disabled = false;
};

const transcodeRecord = async () => {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  ffmpeg.FS("writeFile", files.input, await fetchFile(recorded));
  await ffmpeg.run("-i", files.input, "-r", "60", files.output);
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:00",
    "-frames:v",
    "1",
    files.thumb
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const mp4URL = URL.createObjectURL(mp4Blob);

  const thumbFile = ffmpeg.FS("readFile", files.thumb);
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
  const thumbURL = URL.createObjectURL(thumbBlob);

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  return { mp4URL, thumbURL };
};

const init = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: 1024,
      height: 576,
    },
  });
  videoMessage.innerText = "Press Start button below to start recording";
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

  // video 에 녹화 작동 전까지는 기다리라는 화면 띄우고
  // 이후에는 start 누르기를 기다리는 중이라는 화면 띄우기

  recorder.onstart = () => {
    videoMessageBox.style.display = "None";
    video.style = null;
    recorded = null;
    video.src = null;
    video.srcObject = stream;
    video.play();
  };

  recorder.ondataavailable = (event) => {
    recorded = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = recorded;
    video.loop = true;
    video.play();
  };
};

const toggleRecord = () => {
  switch (recorder.state) {
    case "recording":
      recordPause();
      break;
    case "paused":
      recordResume();
      break;
    default:
      recordStart();
  }
};

init();
recordBtn.addEventListener("mousedown", toggleRecord);
downloadBtn.addEventListener("mousedown", downloadRecord);
