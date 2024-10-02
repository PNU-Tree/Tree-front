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

  const elVideoBG = createLoginBG();
  if (elVideoBG) playerDiv.append(elVideoBG);

  const elLoginForm = createLoginModal();
  if (elLoginForm) playerDiv.append(elLoginForm);
}

function showSignUpModal() {
  document.getElementById("loginBG").remove();

  const elVideoBG = createLoginBG();
  if (elVideoBG) playerDiv.append(elVideoBG);

  const elSignUpForm = createSignUpModal();
  if (elSignUpForm) playerDiv.append(elSignUpForm);
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

  const elLoginTitle = createModalTitle("loginTitle", "로그인");
  elLoginBg.append(elLoginTitle);

  const elLoginIdInput = createIdInput();
  elLoginBg.append(elLoginIdInput);

  const elLoginPasswordInput = createPasswordInput();
  elLoginBg.append(elLoginPasswordInput);

  const elSubmitButton = createLoginButton();
  elLoginBg.append(elSubmitButton);

  const elSignUpLink = createSignUpLink();
  elLoginBg.append(elSignUpLink);

  return elLoginBg;
}

function createSignUpModal() {
  if (document.getElementById("signUpBG")) return;

  const elSignUpBG = document.createElement("div");
  elSignUpBG.id = "signUpBG";
  elSignUpBG.style.cssText = `width: 350px; box-sizing: border-box;
                             border-radius: 10px; padding: 30px 20px 40px; 
                             background-color: #121212;`;

  const elLoginTitle = createModalTitle("signUpTitle", "회원가입");
  elSignUpBG.append(elLoginTitle);

  const elLoginIdInput = createIdInput();
  elSignUpBG.append(elLoginIdInput);

  const elLoginPasswordInput = createPasswordInput();
  elSignUpBG.append(elLoginPasswordInput);

  const elSubmitButton = createSignUpButton();
  elSignUpBG.append(elSubmitButton);

  return elSignUpBG;
}

function createLoginBG() {
  if (document.getElementById("modalVideoBG")) return;

  const elVideoBG = document.createElement("img");
  elVideoBG.id = "modalVideoBG";
  elVideoBG.src = "../../images/VideoBG.png";
  elVideoBG.style.width = "100%";
  elVideoBG.style.filter = "blur(6px)";
  elVideoBG.style.opacity = "60%";
  elVideoBG.style.position = "absolute";
  elVideoBG.style.zIndex = "-1";

  return elVideoBG;
}

function createModalTitle(id, text) {
  if (document.getElementById(id)) return;

  const elTitle = document.createElement("div");
  elTitle.id = id;
  elTitle.innerText = text;
  elTitle.style.cssText = `color: #efefef; font-size: 24px; font-weight: 650; margin-bottom: 40px;`;

  return elTitle;
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

function createButton() {
  const elButton = document.createElement("button");
  elButton.style.cssText = `width: 100%; padding: 10px;  margin: 0; box-sizing: border-box;
                                  border: 0.1px solid #7a7a7a; border-radius: 8px; cursor: pointer;
                                  color: #efefef; font-size: 18px; background-color: #2a2a2a;`;
  elButton.addEventListener("mouseover", function (e) {
    e.target.style.backgroundColor = "#121212";
    e.target.style.boxShadow = "inset 6px 4px 8px rgba(255, 255, 255, 0.3)";
  });
  elButton.addEventListener("mouseout", function (e) {
    e.target.style.backgroundColor = "#2a2a2a";
    e.target.style.boxShadow = "none";
  });
  elButton.addEventListener("mousedown", function (e) {
    e.target.style.boxShadow = "inset -8px -4px 8px rgba(255, 255, 255, 0.3)";
  });
  elButton.addEventListener("mouseup", function (e) {
    e.target.style.boxShadow = "inset 5px 4px 8px rgba(255, 255, 255, 0.3)";
  });

  return elButton;
}

function createLoginButton() {
  if (document.getElementById("loginButton")) return;

  const elLoginButton = createButton();
  elLoginButton.id = "loginButton";
  elLoginButton.innerText = "로그인";

  elLoginButton.addEventListener("click", function (e) {
    const nickName = document.getElementById("idInput").value;
    const password = document.getElementById("passwordInput").value;

    if (!nickName || !password) return;
    login(nickName, password);
  });

  return elLoginButton;
}

function createSignUpLink() {
  if (document.getElementById("signUpLink")) return;

  const elSignUpLink = document.createElement("a");
  elSignUpLink.id = "signUpLink";
  elSignUpLink.innerText = "회원가입";
  elSignUpLink.style.textAlign = "center";
  elSignUpLink.style.cssText = `width: 100%; box-sizing: border-box; display: block; 
                                cursor: pointer; padding-top: 12px;
                                text-align: center; color: #efefef; font-size: 14px;`;

  elSignUpLink.addEventListener("click", function (e) {
    showSignUpModal();
  });

  return elSignUpLink;
}

function createSignUpButton() {
  if (document.getElementById("signUpButton")) return;

  const elLoginButton = createButton();
  elLoginButton.id = "signUpButton";
  elLoginButton.innerText = "회원가입";

  elLoginButton.addEventListener("click", function (e) {
    const nickName = document.getElementById("idInput").value;
    const password = document.getElementById("passwordInput").value;

    if (!nickName || !password) return;
    signUp(nickName, password);
  });

  return elLoginButton;
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
      // TODO: 로그인 id 저장
    })
    .catch((error) => {});
}

function login(nickName, password) {
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
      document.getElementById("loginBG").remove();
      playGame();
      // TODO: 로그인 id 저장
    })
    .catch((error) => {});
}
