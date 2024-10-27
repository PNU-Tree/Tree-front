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
  const signaling = new WebSocketSignaling("localhost:6001");
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
}

async function onDisconnect(connectionId) {
  clearStatsMessage();
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
