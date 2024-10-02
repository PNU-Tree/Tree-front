import {
  createModalTitle,
  createIdInput,
  createPasswordInput,
  createButton,
} from "./elementCommon.js";

export function createSignUpModal() {
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
