import BasePresenter from "../../utils/base-presenter";

export default class RegisterPresenter extends BasePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    super();
    this.#view = view;
    this.#model = model;
  }

  async getRegistered({ name, email, password }) {
    try {
      // Validasi input
      if (!name?.trim()) throw new Error("Nama harus diisi");
      if (!email?.trim()) throw new Error("Email harus diisi");
      if (!password?.trim()) throw new Error("Password harus diisi");
      if (password.length < 6) throw new Error("Password minimal 6 karakter");

      this.showSubmitLoadingButton("Memproses Pendaftaran...");

      const response = await this.#model.register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      if (!response.ok) {
        throw new Error(response.message || "Registrasi gagal");
      }

      this.#view.registeredSuccessfully(response.message);
    } catch (error) {
      this.#view.registeredFailed(error.message);
    } finally {
      this.hideSubmitLoadingButton("Daftar Akun");
    }
  }
}
