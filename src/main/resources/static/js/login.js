document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();  // 폼 제출을 막고, JS로 처리

  const id = document.getElementById('id').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const data = {
    id: id,
    username: username,
    password: password
  };

  fetch('https://other-server.com/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('responseMessage').innerText = '로그인 성공!';
  })
  .catch((error) => {
    console.error('Error:', error);
    document.getElementById('responseMessage').innerText = '로그인 실패. 다시 시도하세요.';
  });
});
