import { getServerConfig, getRTCConfiguration } from "../../js/main/config.js";
import { createDisplayStringArray } from "../../js/main/stats.js";
import { VideoPlayer } from "../../js/main/videoplayer.js";
import { RenderStreaming } from "../../module/renderstreaming.js";
import { Signaling, WebSocketSignaling } from "../../module/signaling.js";
import { createSignInModal } from "./elementSignIn.js";
import { createSignUpModal } from "./elementSignUp.js";
import { createModalVideoBG } from "./elementCommon.js";
import { timeFormat } from "../utils.js";

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
const timeStampDiv = document.getElementById("timeStamp");
let startTime = 0;

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
  showLoginModal();
}

function showWarningIfNeeded(startupMode) {
  const warningDiv = document.getElementById("warning");
  if (startupMode == "private") {
    warningDiv.innerHTML =
      "<h4>Warning</h4> This sample is not working on Private Mode.";
    warningDiv.hidden = false;
  }
}

function showLoginModal() {
  playerDiv.style.border = "1px solid #ababab";
  playerDiv.style.boxShadow = "0px 0px 4px #ababab";

  const elVideoBG = createModalVideoBG();
  if (elVideoBG) playerDiv.append(elVideoBG);

  const elLoginForm = createSignInModal();
  if (elLoginForm) playerDiv.append(elLoginForm);

  document
    .getElementById("signInButton")
    .addEventListener("click", function (e) {
      const nickName = document.getElementById("idInput").value;
      const password = document.getElementById("passwordInput").value;

      if (!nickName || !password) return;
      signIn(nickName, password);
    });

  const signUpLink = document.getElementById("signUpLink");
  if (signUpLink) {
    signUpLink.addEventListener("click", showSignUpModal);
  }
}

function showSignUpModal() {
  document.getElementById("signInBG").remove();

  const elVideoBG = createModalVideoBG();
  if (elVideoBG) playerDiv.append(elVideoBG);

  const elSignUpForm = createSignUpModal();
  if (elSignUpForm) playerDiv.append(elSignUpForm);

  document
    .getElementById("signUpButton")
    .addEventListener("click", function (e) {
      const nickName = document.getElementById("idInput").value;
      const password = document.getElementById("passwordInput").value;

      if (!nickName || !password) return;
      signUp(nickName, password);
    });
}

function playGame() {
  // add video player
  videoPlayer.createPlayer(playerDiv);
  setupRenderStreaming();

  startTime = Date.now();
  rAFStopwatch(Date.now());
}

function rAFStopwatch(startTime) {
  const now = Date.now();
  const start = startTime;
  const elapsedTime = now - start;

  timeStampDiv.innerHTML = `<span  style="font-size: 16px;">소요시간: </span> ${timeFormat(
    elapsedTime
  )}`;

  requestAnimationFrame(() => {
    rAFStopwatch(startTime);
  });
}

async function setupRenderStreaming() {
  const signaling = useWebSocket ? new WebSocketSignaling() : new Signaling();
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
}

async function onDisconnect(connectionId) {
  messageDiv.style.display = "block";
  messageDiv.innerText = `Disconnect peer on ${connectionId}.`;

  await renderstreaming.stop();
  renderstreaming = null;
  videoPlayer.deletePlayer();
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
let lastStats;
/** @type {number} */
let intervalId;

function showStatsMessage() {
  intervalId = setInterval(async () => {
    if (renderstreaming == null) {
      return;
    }

    const stats = await renderstreaming.getStats();
    if (stats == null) {
      return;
    }

    const array = createDisplayStringArray(stats, lastStats);
    if (array.length) {
      messageDiv.style.display = "block";
      messageDiv.innerHTML = array.join("<br>");
    }
    lastStats = stats;
  }, 1000);
}

function signIn(nickName, password) {
  const data = { nickName, password };

  // TODO: domain 주소 수정해주세요.
  fetch("https://other-server.com/signIn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("modalVideoBG").remove();
      document.getElementById("signInBG").remove();
      playGame();
    })
    .catch((error) => {});
}

function signUp(nickName, password) {
  const data = { nickName, password };

  // TODO: domain 주소 수정해주세요.
  fetch("https://other-server.com/signUp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("modalVideoBG").remove();
      document.getElementById("signUpBG").remove();
      playGame();
    })
    .catch((error) => {});
}
