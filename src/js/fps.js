import { getServerConfig, getRTCConfiguration } from "/src/js/main/config.js";
import { createDisplayStringArray } from "/src/js/main/stats.js";
import { VideoPlayer } from "/src/js/main/videoplayer.js";
import { RenderStreaming } from "/src/js/webApp/renderstreaming.js";
import { WebSocketSignaling } from "/src/js/webApp/signaling.js";

/** @type {Element} */
let playButton;
/** @type {RenderStreaming} */
let renderstreaming;
/** @type {boolean} */
let useWebSocket;

const supportsSetCodecPreferences =
  window.RTCRtpTransceiver &&
  "setCodecPreferences" in window.RTCRtpTransceiver.prototype;
const messageDiv = document.getElementById("message");
messageDiv.style.display = "none";

const playerDiv = document.getElementById("player");
const videoPlayer = new VideoPlayer();

setup();

window.document.oncontextmenu = function () {
  return false; // cancel default menu
};

window.addEventListener(
  "resize",
  function () {
    videoPlayer.resizeVideo();
  },
  true
);

window.addEventListener(
  "beforeunload",
  async () => {
    if (!renderstreaming) return;
    await renderstreaming.stop();
  },
  true
);

async function setup() {
  const res = await getServerConfig();
  useWebSocket = res.useWebSocket;
  showWarningIfNeeded(res.startupMode);
  showPlayButton();
}

function showWarningIfNeeded(startupMode) {
  const warningDiv = document.getElementById("warning");
  if (startupMode == "private") {
    warningDiv.innerHTML =
      "<h4>Warning</h4> This sample is not working on Private Mode.";
    warningDiv.hidden = false;
  }
}

function showPlayButton() {
  if (!document.getElementById("playButton")) {
    const elementPlayButton = document.createElement("img");
    elementPlayButton.id = "playButton";
    elementPlayButton.src = "/public/images/Play.png";
    elementPlayButton.alt = "Start Streaming";
    playButton = document
      .getElementById("player")
      .appendChild(elementPlayButton);
    playButton.addEventListener("click", onClickPlayButton);
  }
}

function onClickPlayButton() {
  playButton.style.display = "none";

  // add video player
  videoPlayer.createPlayer(playerDiv);
  setupRenderStreaming();
  measurePerformance();
}

async function setupRenderStreaming() {
  const signaling = new WebSocketSignaling("localhost:7001");
  const config = getRTCConfiguration();
  renderstreaming = new RenderStreaming(signaling, config);
  renderstreaming.onConnect = onConnect;
  renderstreaming.onDisconnect = onDisconnect;
  renderstreaming.onTrackEvent = (data) => videoPlayer.addTrack(data.track);
  renderstreaming.onGotOffer = setCodecPreferences;

  await renderstreaming.start();
  await renderstreaming.createConnection();
}

function onConnect() {
  const channel = renderstreaming.createDataChannel("input");
  videoPlayer.setupInput(channel);
  // showStatsMessage();
  stopwatch.start();
}

async function onDisconnect(connectionId) {
  stopwatch.stop();

  const authStr = localStorage.getItem("auth");
  const auth = JSON.parse(authStr);
  if (!auth || !auth.token || !auth.nickname) { location.reload(); return;}
  axios
    .post(
      "http://172.171.134.142:8080/rankings",
      {
        nickName: auth.nickname,
        maxScore: stopwatch.getTimes(),
      },
      {
        headers: { Authorization: auth.token },
      }
    )
    .then((res) => {
      const tostMessage = document.getElementById("tost-message");
      tostMessage.innerText = "랭킹이 등록됐습니다!";
      tostMessage.style.background = "#00ff0070";
      tostMessage.classList.add("active");

      setTimeout(function () {
        tostMessage.classList.remove("active");
        location.replace("/rank/");
      }, 1000);
    })
    .catch((err) => {
      const tostMessage = document.getElementById("tost-message");
      tostMessage.innerText = "랭킹 등록에 실패했습니다!";
      tostMessage.style.background = "#ff000070";
      tostMessage.classList.add("active");

      setTimeout(function () {
        tostMessage.classList.remove("active");
        location.replace("/");
      }, 1000);
    });

  // clearStatsMessage();
  messageDiv.style.display = "block";
  messageDiv.innerText = `Disconnect peer on ${connectionId}.`;

  await renderstreaming.stop();
  renderstreaming = null;
  videoPlayer.deletePlayer();
  showPlayButton();
}

function setCodecPreferences() {
  /** @type {RTCRtpCodecCapability[] | null} */
  let selectedCodecs = null;

  const codecPreferences = [
    "video/VP8",
    "video/H264 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f",
    "video/H264 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f",
    "video/H264 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f",
    "video/H264 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42e01f",
    "video/H264 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f",
    "video/H264 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=4d001f",
    "video/AV1 level-idx=5;profile=0;tier=0",
    "video/VP9 profile-id=0",
    "video/VP9 profile-id=2",
    "video/H264 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=640034",
  ];

  if (supportsSetCodecPreferences) {
    const [mimeType, sdpFmtpLine] = codecPreferences[0].split(" ");
    const { codecs } = RTCRtpSender.getCapabilities("video");
    const selectedCodecIndex = codecs.findIndex(
      (c) => c.mimeType === mimeType && c.sdpFmtpLine === sdpFmtpLine
    );
    const selectCodec = codecs[selectedCodecIndex];
    selectedCodecs = [selectCodec];
  }

  if (selectedCodecs == null) {
    return;
  }
  const transceivers = renderstreaming
    .getTransceivers()
    .filter((t) => t.receiver.track.kind == "video");
  if (transceivers && transceivers.length > 0) {
    transceivers.forEach((t) => t.setCodecPreferences(selectedCodecs));
  }
}

/** @type {RTCStatsReport} */
let prevStats;
function measurePerformance() {
  setInterval(async () => {
    if (renderstreaming == null) return;

    const stats = await renderstreaming.getStats();
    if ( !stats ) return;
    if ( !prevStats ) { prevStats = stats; return; }

    stats.forEach((stat) => {
      if (stat.type !== "inbound-rtp" || stat.kind !== "video") return;

      const prevStat = prevStats.get(stat.id);
      if( !prevStat ) { console.log("prvStat not exist", stat.id); return; }
      const duration = (stat.timestamp - prevStat.timestamp) / 1000;
      const bitrate = (8 * (stat.bytesReceived - prevStat.bytesReceived)) / duration / 1000;

      console.log(`Bitrate: ${bitrate.toFixed(2)} kbit/sec, Framerate: ${stat.framesPerSecond}`);
    });

    prevStats = stats;
  }, 1000);
}

function clearStatsMessage() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  lastStats = null;
  intervalId = null;
  messageDiv.style.display = "none";
  messageDiv.innerHTML = "";
}


class Stopwatch {
  constructor() {
    this.running = false;
    this.reset();
    this.print(this.times);
  }
  reset() {
    this.times = [0, 0, 0];
  }
  start() {
    if (!this.time) this.time = performance.now();
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(this.step.bind(this));
    }
  }
  stop() {
    this.running = false;
    this.time = null;
  }
  step(timestamp) {
    if (!this.running) return;
    this.calculate(timestamp);
    this.time = timestamp;
    this.print();
    requestAnimationFrame(this.step.bind(this));
  }
  calculate(timestamp) {
    var diff = timestamp - this.time;
    this.times[2] += diff / 10;
    if (this.times[2] >= 100) {
      this.times[1] += 1;
      this.times[2] -= 100;
    }
    if (this.times[1] >= 60) {
      this.times[0] += 1;
      this.times[1] -= 60;
    }
  }
  print() {
    const message = document.getElementById("unity-message");
    if( !this.times || !message ) return
    message.innerText = `소요시간: ${this.format(this.times)}`;
  }
  format(times) {
    return `${pad0(times[0], 2)}:${pad0(times[1], 2)}:${pad0(
      Math.floor(times[2]),
      2
    )}`;
  }
  getTimes() {
    return parseInt(this.times[0] * 60 * 100 + this.times[1] * 100 + this.times[2]);
  }
}

function pad0(value, count) {
  var result = value.toString();
  for (; result.length < count; --count) result = "0" + result;
  return result;
}

const stopwatch = new Stopwatch();