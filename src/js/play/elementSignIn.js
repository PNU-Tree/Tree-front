import {
  createModalTitle,
  createIdInput,
  createPasswordInput,
  createButton,
} from "./elementCommon.js";

export function createSignInModal() {
  if (document.getElementById("signInBG")) return;

  const elSignInBg = document.createElement("div");
  elSignInBg.id = "signInBG";
  elSignInBg.style.cssText = `width: 350px; box-sizing: border-box;
                             border-radius: 10px; padding: 30px 20px 40px; 
                             background-color: #121212;`;

  const elSignInTitle = createModalTitle("signInTitle", "로그인");
  elSignInBg.append(elSignInTitle);

  const elSignInIdInput = createIdInput();
  elSignInBg.append(elSignInIdInput);

  const elSignInPasswordInput = createPasswordInput();
  elSignInBg.append(elSignInPasswordInput);

  const elSubmitButton = createSignInButton();
  elSignInBg.append(elSubmitButton);

  const elSignUpLink = createSignUpLink();
  elSignInBg.append(elSignUpLink);

  return elSignInBg;
}

function createSignInButton() {
  if (document.getElementById("signInButton")) return;

  const elSignInButton = createButton();
  elSignInButton.id = "signInButton";
  elSignInButton.innerText = "로그인";

  return elSignInButton;
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

  return elSignUpLink;
}
