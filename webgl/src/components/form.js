class CustomForm extends HTMLElement {
  static get observedAttributes() {
    return ["category"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "category") {
      this.render();
      this.updateDisplay();
    }
  }

  render() {
    const category = this.getAttribute("category");
    this.innerHTML = `
      <style>
        form {
          max-width: 400px;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        #nickname-div, #password-div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        label {
          font-size: 0.95rem;
        }
        input {
          font-size: 1.05rem;
          padding: 0.75rem;
          border: 0.05rem solid #aaa;
          border-radius: 8px;
        }
        #form-btn {
          background-color: #343a55;
          box-shadow: 2px 8px 12px rgba(0, 0, 0, 0.4);
        }
        #form-btn:hover {
          background-color: #0d101f;
          box-shadow: 2px 8px 12px rgba(0, 0, 0, 0.4);
        }
        .error-text { color: #ff9999; }
        .error { border: 0.05rem solid #ff9999; }
      </style>
      <link rel="stylesheet" href="../globals.css" />
      <form action="" id="sign-form">
        <div id="nickname-div">
          <label for="nickname">닉네임</label>
          <input id="nickname" placeholder="닉네임 (Nickname)" />
        </div>
        <div id="password-div">
          <label for="password">비밀번호</label>
          <input type="password" id="password" placeholder="비밀번호 (password)" />
        </div>
        <button type="submit" id="form-btn" class="ripple-button">${category}</button>
      </form>
    `;
  }

  updateDisplay() {
    const button = this.querySelector("#form-btn");

    button.addEventListener("click", function (e) {
      const rect = button.getBoundingClientRect();
      const x = e.x - rect.left;
      const y = e.y - rect.top;

      const ripple = document.createElement("div");
      ripple.classList.add("animate");
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.background = `#bdc3c7`;

      ripple.style.setProperty("--material-scale", button.offsetWidth);
      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 500);
    });
  }
}

customElements.define("custom-form", CustomForm);
