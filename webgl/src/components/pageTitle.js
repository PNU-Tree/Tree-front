class PageTitle extends HTMLElement {
  static get observedAttributes() {
    return ["title"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "title") {
      this.render();
    }
  }

  render() {
    const title = this.getAttribute("title") || "Title";
    this.innerHTML = `
      <div style="font-size: 1.5rem; padding-bottom: 2rem; cursor: default;">
        <a href="/" style="padding-right: 0.5rem;">
          <i class="fa-solid fa-arrow-left"></i>
        </a>
        ${title}
      </div>
    `;
  }
}

customElements.define("page-title", PageTitle);
