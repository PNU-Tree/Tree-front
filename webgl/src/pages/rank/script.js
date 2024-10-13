axios({
  method: "get",
  url: "http://172.171.134.142:8080/rankings",
})
  .then((res) => {
    if (res.status !== 200) return;

    console.log(res.data);
    const tbody = document.getElementById("table-content");
    res.data.map((data) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td style="width: 50px;">${
        data.rankNumber
      }</td> <td style="width: 150px;">${
        data.nickName
      }</td> <td style="width: 100px;">${timerFormat(data.maxScore)}</td>`;

      tbody.append(tr);
    });
  })
  .catch((err) => {
    const tostMessage = document.getElementById("tost-message");
    tostMessage.innerText = "랭킹을 불러오는데 실패했습니다.!";
    tostMessage.style.background = "#ff000070";
    tostMessage.classList.add("active");

    setTimeout(function () {
      tostMessage.classList.remove("active");
      location.replace("/");
    }, 1000);
  });

function timerFormat(time) {
  const mm = parseInt(time / (60 * 100));
  time %= 60 * 100;
  const ss = parseInt(time / 100);
  time %= 100;

  return `${pad0(mm, 2)}:${pad0(ss, 2)}:${pad0(time, 2)}`;
}

function pad0(value, count) {
  var result = value.toString();
  for (; result.length < count; --count) result = "0" + result;
  return result;
}
