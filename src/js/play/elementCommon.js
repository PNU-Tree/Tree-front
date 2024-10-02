export function createModalVideoBG() {
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

export function createModalBox(id) {
  if (document.getElementById(id)) return;

  const elModalBox = document.createElement("div");
  elModalBox.id = id;
  elModalBox.style.cssText = `width: 350px; box-sizing: border-box;
                             border-radius: 10px; padding: 30px 20px 40px; 
                             background-color: #121212;`;
  return elModalBox;
}

export function createModalTitle(id, text) {
  if (document.getElementById(id)) return;

  const elTitle = document.createElement("div");
  elTitle.id = id;
  elTitle.innerText = text;
  elTitle.style.cssText = `color: #efefef; font-size: 24px; font-weight: 650; margin-bottom: 40px;`;

  return elTitle;
}

export function createIdInput() {
  if (document.getElementById("idBox")) return;

  const elIdBox = document.createElement("div");
  elIdBox.id = "idBox";
  elIdBox.style.cssText = `position: relative; width: 100%;  margin-bottom: 30px;`;

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

  elIdBox.append(elIdLabel);
  elIdBox.append(elIdInput);

  return elIdBox;
}

export function createPasswordInput() {
  if (document.getElementById("passwordBox")) return;

  const elPasswordBox = document.createElement("div");
  elPasswordBox.id = "passwordBox";
  elPasswordBox.style.cssText = `position: relative; width: 100%;  margin-bottom: 30px;`;

  const elPasswordLabel = document.createElement("label");
  elPasswordLabel.id = "passwordLabel";
  elPasswordLabel.for = "passwordInput";
  elPasswordLabel.innerText = "비밀번호";
  elPasswordLabel.style.cssText = `position: absolute; top: -18px; left: 4px; color: #efefef; font-size: 14px;`;

  const elPasswordInput = document.createElement("input");
  elPasswordInput.id = "passwordInput";
  elPasswordInput.type = "password";
  elPasswordInput.style.cssText = `width: 100%; padding: 10px; box-sizing: border-box; 
                                  border: 0.1px solid #7a7a7a; border-radius: 8px;
                                  color: #efefef; font-size: 18px; background-color: #2a2a2a; outline: none;`;
  elPasswordInput.placeholder = "비밀번호 (password)";

  elPasswordBox.append(elPasswordLabel);
  elPasswordBox.append(elPasswordInput);

  return elPasswordBox;
}

export function createButton() {
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
