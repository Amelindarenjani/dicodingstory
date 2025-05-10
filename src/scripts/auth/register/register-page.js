import RegisterPresenter from "./register-presenter";
import DicodingStoryApi from "../../../scripts/data/dicoding-story-api";
import { updateAuthUI } from "../../utils/auth-ui";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="register-container" aria-labelledby="register-title">
        <div class="register-form-container">
          <h1 id="register-title" class="register__title">Daftar akun</h1>

          <form id="register-form" class="register-form">
            <div class="form-control">
              <label for="name-input" id="name-label">Nama lengkap</label>
              <input 
              id="name-input" 
              type="text" 
              name="name" 
              aria-labelledby="name-label"
              placeholder="Masukkan nama lengkap Anda"
              aria-required="true"
              required
            >
            </div>
            
            <div class="form-control">
              <label for="email-input" id="email-label" class="register-form__email-title">Email</label>

              <div class="register-form__title-container">
                <input id="email-input" type="email" name="email" placeholder="Contoh: nama@email.com">
              </div>
            </div>
            <div class="form-control">
              <label for="password-input" class="register-form__password-title">Password</label>

              <div class="register-form__title-container">
                <input id="password-input" type="password" name="password" placeholder="Masukkan password baru">
              </div>
            </div>
            <div class="form-buttons register-form__form-buttons">
              <div id="submit-button-container">
                <button class="btn" type="submit">Daftar akun</button>
              </div>
              <p class="register-form__already-have-account">Sudah punya akun? <a href="#/login">Masuk</a></p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: DicodingStoryApi,
    });

    this.#setupForm();
  }

  #setupForm() {
    const form = document.getElementById("register-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = {
        name: document.getElementById("name-input")?.value,
        email: document.getElementById("email-input")?.value,
        password: document.getElementById("password-input")?.value,
      };
      await this.#presenter.getRegistered(data);
    });
  }

  registeredSuccessfully(message) {
    console.log(message);
    updateAuthUI();
    window.location.hash = "#/login";
  }

  registeredFailed(message) {
    const form = document.getElementById("register-form");
    if (!form) return;

    const existingError = form.querySelector(".error-message");
    if (existingError) {
      form.removeChild(existingError);
    }

    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.setAttribute("role", "alert");
    errorElement.textContent = message;

    form.insertBefore(errorElement, form.firstChild);
    errorElement.focus();
  }
}
