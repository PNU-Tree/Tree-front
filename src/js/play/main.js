import { getServerConfig, getRTCConfiguration } from "../../js/main/config.js";
import { createDisplayStringArray } from "../../js/main/stats.js";
import { VideoPlayer } from "../../js/main/videoplayer.js";
import { RenderStreaming } from "../../module/renderstreaming.js";
import { Signaling, WebSocketSignaling } from "../../module/signaling.js";

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
  playerDiv.style.border = "1px solid #ababab";
  playerDiv.style.boxShadow = "0px 0px 4px #ababab";

  const elVideoBG = createLoginBG();
  playerDiv.append(elVideoBG);

  const elLoginForm = createLoginModal();
  playerDiv.append(elLoginForm);
}

function playGame() {
  // add video player
  videoPlayer.createPlayer(playerDiv);
  setupRenderStreaming();
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

function clearStatsMessage() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  lastStats = null;
  intervalId = null;
  messageDiv.style.display = "none";
  messageDiv.innerHTML = "";
}

function createLoginModal() {
  if (document.getElementById("loginBG")) return;

  const elLoginBg = document.createElement("div");
  elLoginBg.id = "loginBG";
  elLoginBg.style.cssText = `width: 350px; box-sizing: border-box;
                             border-radius: 10px; padding: 30px 20px 40px; 
                             background-color: #121212;`;

  const elLoginTitle = createLoginTitle();
  elLoginBg.append(elLoginTitle);

  const elLoginIdInput = createIdInput();
  elLoginBg.append(elLoginIdInput);

  const elLoginPasswordInput = createPasswordInput();
  elLoginBg.append(elLoginPasswordInput);

  const elSubmitButton = createLoginButton();
  elLoginBg.append(elSubmitButton);

  return elLoginBg;
}

function createLoginBG() {
  if (document.getElementById("loginVideoBG")) return;

  const elVideoBG = document.createElement("img");
  elVideoBG.id = "loginVideoBG";
  elVideoBG.src = "../../images/VideoBG.png";
  elVideoBG.style.width = "100%";
  elVideoBG.style.filter = "blur(6px)";
  elVideoBG.style.opacity = "60%";
  elVideoBG.style.position = "absolute";
  elVideoBG.style.zIndex = "-1";

  return elVideoBG;
}

function createLoginTitle() {
  if (document.getElementById("loginTitle")) return;

  const elLoginTitle = document.createElement("div");
  elLoginTitle.id = "loginTitle";
  elLoginTitle.innerText = "로그인";
  elLoginTitle.style.cssText = `color: #efefef; font-size: 24px; font-weight: 650; margin-bottom: 40px;`;

  return elLoginTitle;
}

function createIdInput() {
  if (document.getElementById("idWrapper")) return;

  const elIdWrapper = document.createElement("div");
  elIdWrapper.id = "idWrapper";
  elIdWrapper.style.cssText = `position: relative; width: 100%;  margin-bottom: 30px;`;

  const elIdLabel = document.createElement("label");
  elIdLabel.id = "idLabel";
  elIdLabel.for = "idInput";
  elIdLabel.innerText = "닉네임";
  elIdLabel.style.cssText = `position: absolute; top: -18px; left: 4px; color: #efefef; font-size: 14px;`;

  const elIdInput = document.createElement("input");
  elIdInput.id = "idInput";
  elIdInput.style.cssText = `width: 100%; padding: 10px; box-sizing: border-box; 
                                  border: 0.1px solid #7a7a7a; border-radius: 8px;
                                  color: #efefef; font-size: 18px; background-color: #2a2a2a; outline: none;`;
  elIdInput.placeholder = "닉네임 (nickName)";

  elIdWrapper.append(elIdLabel);
  elIdWrapper.append(elIdInput);

  return elIdWrapper;
}

function createPasswordInput() {
  if (document.getElementById("passwordWrapper")) return;

  const elPasswordWrapper = document.createElement("div");
  elPasswordWrapper.id = "passwordWrapper";
  elPasswordWrapper.style.cssText = `position: relative; width: 100%;  margin-bottom: 30px;`;

  const elPasswordLabel = document.createElement("label");
  elPasswordLabel.id = "passwordLabel";
  elPasswordLabel.for = "passwordInput";
  elPasswordLabel.innerText = "비밀번호";
  elPasswordLabel.style.cssText = `position: absolute; top: -18px; left: 4px; color: #efefef; font-size: 14px;`;
  elPasswordWrapper.append(elPasswordLabel);

  const elPasswordInput = document.createElement("input");
  elPasswordInput.id = "passwordInput";
  elPasswordInput.type = "password";
  elPasswordInput.style.cssText = `width: 100%; padding: 10px; box-sizing: border-box; 
                                  border: 0.1px solid #7a7a7a; border-radius: 8px;
                                  color: #efefef; font-size: 18px; background-color: #2a2a2a; outline: none;`;
  elPasswordInput.placeholder = "비밀번호 (password)";

  elPasswordWrapper.append(elPasswordInput);

  return elPasswordWrapper;
}

function createLoginButton() {
  if (document.getElementById("loginButton")) return;

  const elLoginButton = document.createElement("button");
  elLoginButton.className = "contained-button";
  elLoginButton.id = "loginButton";
  elLoginButton.innerText = "로그인";
  elLoginButton.style.cssText = `width: 100%; padding: 10px;  margin: 0; box-sizing: border-box;
                                  border: 0.1px solid #7a7a7a; border-radius: 8px; cursor: pointer;
                                  color: #efefef; font-size: 18px; background-color: #2a2a2a;`;
  elLoginButton.addEventListener("mouseover", function (e) {
    e.target.style.backgroundColor = "#121212";
    e.target.style.boxShadow = "inset 6px 4px 8px rgba(255, 255, 255, 0.3)";
  });
  elLoginButton.addEventListener("mouseout", function (e) {
    e.target.style.backgroundColor = "#2a2a2a";
    e.target.style.boxShadow = "none";
  });
  elLoginButton.addEventListener("mousedown", function (e) {
    e.target.style.boxShadow = "inset -8px -4px 8px rgba(255, 255, 255, 0.3)";
  });
  elLoginButton.addEventListener("mouseup", function (e) {
    e.target.style.boxShadow = "inset 5px 4px 8px rgba(255, 255, 255, 0.3)";
  });

  elLoginButton.addEventListener("click", function (e) {
    const nickName = document.getElementById("idInput").value;
    const password = document.getElementById("passwordInput").value;

    if (!nickName || !password) return;

    const data = { nickName, password };

    // TODO: url 주소 수정해주세요.
    fetch("https://other-server.com/signIn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("loginVideoBG").remove();
        document.getElementById("loginBG").remove();
        playGame();
      })
      .catch((error) => {});
  });

  return elLoginButton;
}
