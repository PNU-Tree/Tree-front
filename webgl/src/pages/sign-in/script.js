const signInForm = document.getElementById("sign-form");

const nicknameInput = document.getElementById("nickname");
const passwordInput = document.getElementById("password");

signInForm.addEventListener("submit", (e) => {
  e.preventDefault();

  axios({
    method: 'post',
    url: 'http://172.171.134.142:8080/signIn',
    data: {
      nickName: nicknameInput.value,
      password: passwordInput.value
    }
  }).then((res) => {
    console.log(res.data.token);
    if(res.status === 200) {
      const tostMessage = document.getElementById("tost-message");
      tostMessage.innerText = "로그인에 성공했습니다!";
      tostMessage.style.background = "#00ff0070";
      tostMessage.classList.add('active');

      const json = {token: `Bearer ${res.data.token}`, nickname: nicknameInput.value};
      localStorage.setItem("auth", JSON.stringify(json))

      setTimeout(function(){
        tostMessage.classList.remove('active');
        location.replace("/");
      },1000);
    }
  }).catch((err) => {
    tostOn("로그인에 실패했습니다!", "#ff000070");
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

