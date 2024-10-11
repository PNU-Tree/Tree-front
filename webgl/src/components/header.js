class CustomHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.updateDisplay();
  }

  render() {
    this.innerHTML = `
      <style>
        header {
          border-bottom: 0.01rem solid #888;
        }
        #game-div {
          display: flex;
          gap: 1.25rem;
        }
        .hidden { display: none; }
      </style>
      <link rel="stylesheet" href="../globals.css" />
      <header style="padding: 1rem 10%; display: flex; justify-content: space-between; background-color: rgba(0, 0, 0, 0.2);">
        <a href="/" id="logo" style="display: flex; align-items: center; gap: 0.5rem">
          <img
            src="https://avatars.githubusercontent.com/u/175100970?s=200&v=4"
            alt="Tree logo"
            style="width: 2rem; border-radius: 8px"
          />
          <span style="font-size: 1.25rem; font-weight: 650">Tree</span>
        </a>
        <div style="display: flex; align-items: center; gap: 0.5rem">
          <div id="sign-div" style="cursor: default">
            <a id="sign-in" href="/sign-in/">로그인</a> /
            <a id="sign-up" href="/sign-up/">회원가입</a>
          </div>
          <div id="game-div">
            <a id="play-game" href="/play/">게임 실행</a>
            <a id="rank" href="/rank/">랭킹</a>
            <a id="sign-out" href="/sign-out/">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </a>
          </div>
        </div>
      </header>
    `;
  }

  updateDisplay() {
    const authStr = localStorage.getItem("auth");
    const auth = JSON.parse(authStr);

    const signDiv = this.querySelector("#sign-div");
    const gameDiv = this.querySelector("#game-div");

    if ( !auth || !auth?.token ) {
      gameDiv.style.display = "none";
    } else {
      signDiv.style.display = "none";
    }
  }
}

customElements.define("custom-header", CustomHeader);
