import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";
import { updateAuthUI } from "../utils/auth-ui";
import { updateNavigation } from "../utils/navigation";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  _currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.supportsViewTransitions = "startViewTransition" in document;
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupRouter();

    window.addEventListener("hashchange", () => {
      this._renderPage();
      updateAuthUI();
    });

    updateAuthUI();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupRouter() {
    // tambahan
    const handleRouteChange = () => {
      const currentPath = window.location.hash.slice(1) || '/';
      if (!routes[currentPath]) {
        window.location.hash = '#/';
        return;
      }
      this._renderPage();
      updateNavigation();
      updateAuthUI();
    };

    window.addEventListener("hashchange", handleRouteChange);
    // Trigger initial render
    handleRouteChange();

    // window.addEventListener("hashchange", () => this._renderPage(),  updateNavigation(), // Tambahkan ini
    // updateAuthUI());
    // window.addEventListener("load", () => this._renderPage(), updateNavigation(), // Tambahkan ini
    // updateAuthUI());
  }

  async _renderPage() {
    try {
      if (
        this._currentPage &&
        typeof this._currentPage.cleanup === "function"
      ) {
        await this._currentPage.cleanup();
      }

      const url = getActiveRoute();
      const page = routes[url] || routes["/"];

      const authenticatedPage = checkAuthenticatedRoute(page);
      const unauthenticatedPage = checkUnauthenticatedRouteOnly(page);
      const finalPage =
        authenticatedPage !== null
          ? authenticatedPage
          : unauthenticatedPage !== null
            ? unauthenticatedPage
            : page;

      if (!finalPage) return;

      if (this.supportsViewTransitions) {
        try {
          const transition = document.startViewTransition(async () => {
            this.#content.innerHTML = await finalPage.render();
            await finalPage.afterRender();
          });

          await transition.ready;
        } catch (transitionError) {
          console.warn("View transition failed:", transitionError);
          this.#content.innerHTML = await finalPage.render();
          await finalPage.afterRender();
        }
      } else {
        this.#content.innerHTML = await finalPage.render();
        await finalPage.afterRender();
      }

      this._currentPage = finalPage;
    } catch (error) {
      console.error("Error during page render:", error);
       // Fallback ke halaman utama jika route tidak valid
      if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
        window.location.hash = '#/';
      }
    }
  }
}

export default App;