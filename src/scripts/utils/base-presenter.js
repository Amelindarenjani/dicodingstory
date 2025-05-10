export default class BasePresenter {
  showSubmitLoadingButton(buttonText = "Memproses...") {
    const container = document.getElementById("submit-button-container");
    if (!container) return;

    container.innerHTML = `
      <button class="btn" type="submit" disabled aria-live="polite" aria-busy="true">
        <i class="fas fa-spinner loader-button" aria-hidden="true"></i> 
        <span class="loading-text">${buttonText}</span>
      </button>
      `;
  }

  hideSubmitLoadingButton(buttonText = "Submit") {
    const container = document.getElementById("submit-button-container");
    if (!container) return;

    container.innerHTML = `
      <button class="btn" type="submit" aria-live="polite">
        ${buttonText}
      </button>
    `;
  }
}
