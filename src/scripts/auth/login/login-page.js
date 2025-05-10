import LoginPresenter from "./login-presenter";
import DicodingStoryAPI from "../../../scripts/data/dicoding-story-api";
import * as AuthModel from "../../../scripts/utils/auth";
import { updateAuthUI } from "../../utils/auth-ui";

export default class LoginPage {
  #presenter = null;

  showSubmitLoadingButton() {
    const container = document.getElementById("submit-button-container");
    if (!container) return;

    container.innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner fa-spin"></i> Memproses...
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    const container = document.getElementById("submit-button-container");
    if (!container) return;

    container.innerHTML = `
      <button class="btn" type="submit">Masuk</button>
    `;
  }

  async render() {
    document.documentElement.style.viewTransitionName = "login-page";
    return `
      <section class="login-container" style="view-transition-name: login-form;">
        <article class="login-form-container">
          <h1 id="login-title" class="login__title">Masuk akun</h1>

          <form id="login-form" class="login-form">
            <div class="form-control">
              <label for="email-input" id="email-label" class="login-form__email-title">Email</label>
              <input 
              id="email-input" 
              type="email" 
              name="email" 
              aria-labelledby="email-label"
              placeholder="Contoh: nama@email.com"
              aria-required="true"
              required
            >
            </div>
            <div class="form-control">
              <label for="password-input" id="password-label" class="login-form__password-title">Password</label>
              <input 
              id="password-input" 
              type="password" 
              name="password" 
              aria-labelledby="password-label"
              placeholder="Masukkan password Anda"
              aria-required="true"
              required
            >
            </div>
            <div class="form-buttons login-form__form-buttons">
              <div id="submit-button-container">
                <button class="btn" type="submit">Masuk</button>
              </div>
              <p class="login-form__do-not-have-account">Belum punya akun? <a href="#/register">Daftar</a></p>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    document.documentElement.style.viewTransitionName = "";
    this.#presenter = new LoginPresenter({
      view: this,
      model: DicodingStoryAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Dapatkan nilai input dengan cara yang lebih aman
      const email = document.getElementById("email-input")?.value?.trim();
      const password = document.getElementById("password-input")?.value?.trim();

      // Validasi input
      if (!email || !password) {
        this.loginFailed("Email dan password harus diisi");
        return;
      }

      try {
        // Gunakan object langsung tanpa variabel data
        await this.#presenter.getLogin({
          email,
          password,
        });
      } catch (error) {
        console.error("Login error:", error);
        this.loginFailed(error.message || "Terjadi kesalahan saat login");
      }
    });
  }

  loginSuccessfully(message) {
    console.log(message);
    updateAuthUI();
    window.location.hash = "#/";
  }

  loginFailed(message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.setAttribute("role", "alert");
    errorElement.setAttribute("aria-live", "assertive");
    errorElement.textContent = message;

    const form = document.getElementById("login-form");
    form.insertBefore(errorElement, form.firstChild);

    setTimeout(() => {
      errorElement.focus();
    }, 100);
  }
}
