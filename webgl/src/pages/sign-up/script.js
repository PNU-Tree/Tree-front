const signInForm = document.getElementById("sign-form");

const nicknameInput = document.getElementById("nickname");
const passwordInput = document.getElementById("password");

signInForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let ret = false;
  if (!validateNickname({ target: nicknameInput })) ret = true;
  if (!validatePassword({ target: passwordInput })) ret = true;
  if (ret) {
    tostOn("형식에 맞게 값을 입력해주세요.", "#ff000070");
    return;
  }

  axios({
    method: 'post',
    url: 'http://172.171.134.142:8080/signUp',
    data: {
      nickName: nicknameInput.value,
      password: passwordInput.value
    }
  }).then((res) => {
    if(res.status === 201) {
      const tostMessage = document.getElementById("tost-message");
      tostMessage.innerText = "계정 생성에 성공했습니다!";
      tostMessage.style.background = "#00ff0070";
      tostMessage.classList.add('active');
      setTimeout(function(){
        tostMessage.classList.remove('active');
        location.replace("/sign-in");
      },1000);
    }
  }).catch((err) => {
    tostOn("계정 생성에 실패했습니다!", "#ff000070");
  });
});

function tostOn(message, color) {
  const tostMessage = document.getElementById("tost-message");
  tostMessage.innerText = message;
  tostMessage.style.background = color;
  tostMessage.classList.add('active');
  setTimeout(function(){
    tostMessage.classList.remove('active');
  }, 1500);
}

nicknameInput.addEventListener("blur", validateNickname);
passwordInput.addEventListener("blur", validatePassword);

function validateNickname(e) {
  document.getElementById("nickname-comment")?.remove();
  e.target.classList.remove("error");
  e.target.previousSibling.previousSibling.classList?.remove("error-text");

  const comment = isWrongNickname(e.target.value);
  if (!comment) return true;

  const commentSpan = document.createElement("span");
  commentSpan.id = "nickname-comment";
  commentSpan.classList.add("error-text");
  commentSpan.style.fontSize = "0.8rem";
  commentSpan.innerText = comment;

  e.target.parentNode.append(commentSpan);
  e.target.classList.add("error");
  e.target.previousSibling.previousSibling.classList.add("error-text");

  return false;
}

function isWrongNickname(nickname) {
  const regex = /^[a-zA-Z가-힣]{2,20}$/;

  if (!regex.test(nickname))
    return "닉네임은 2자에서 20자 이내의 한글, 영어만 가능합니다.";
}

function validatePassword(e) {
  document.getElementById("password-comment")?.remove();
  e.target.classList.remove("error");
  e.target.previousSibling.previousSibling.classList?.remove("error-text");

  const comment = isWrongPassword(e.target.value);
  if (!comment) return true;

  const commentSpan = document.createElement("span");
  commentSpan.id = "password-comment";
  commentSpan.classList.add("error-text");
  commentSpan.style.fontSize = "0.8rem";
  commentSpan.innerText = comment;

  e.target.parentNode.append(commentSpan);
  e.target.classList.add("error");
  e.target.previousSibling.previousSibling.classList.add("error-text");

  return false;
}

function isWrongPassword(password) {
  const regex = /^(?=.*?[A-Za-z])(?=.*?\d)(?=.*?[!@#$%^&*(),.-]).{8,16}$/;

  if (!regex.test(password))
    return "비밀번호는 8자에서 16자 이내이며, 영어, 숫자, 특수문자를 포함해야 합니다.";
}
