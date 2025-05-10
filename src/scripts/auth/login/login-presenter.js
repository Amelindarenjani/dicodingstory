import BasePresenter from "../../utils/base-presenter";

export default class LoginPresenter extends BasePresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    super();
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    try {
      if (!email?.trim()) throw new Error("Email harus diisi");
      if (!password?.trim()) throw new Error("Password harus diisi");

      this.showSubmitLoadingButton("Memproses login...");

      const response = await this.#model.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (!response.ok) {
        throw new Error(response.message || "Login gagal");
      }

      if (!response.data?.loginResult?.token) {
        throw new Error("Token tidak diterima");
      }

      this.#authModel.putAccessToken(response.data.loginResult.token);
      this.#view.loginSuccessfully(response.message);
    } catch (error) {
      console.error("Login error:", error);
      this.#view.loginFailed(error.message);
    } finally {
      this.hideSubmitLoadingButton("Masuk");
    }
  }
}
