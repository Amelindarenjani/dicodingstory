export default class AboutPage {
  async render() {
    return `
      <main class="container" aria-labelledby="about-heading">
        <h1 id="about-heading">About Page</h1>
        <article aria-label="Informasi tentang aplikasi">
          <!-- About content here -->
        </article>
      </main>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}
