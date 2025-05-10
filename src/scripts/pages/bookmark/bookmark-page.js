// src/scripts/pages/bookmark/bookmark-page.js
import { showFormattedDate } from "../../utils";
import BookmarkPresenter from "./bookmark-presenter";

export default class BookmarkPage {
  constructor() {
    this._presenter = new BookmarkPresenter({
      view: this
    });
  }

  async render() {
    return `
      <section class="container" aria-labelledby="bookmark-title">
        <h1 id="bookmark-title">Saved Stories</h1>
        <div id="bookmark-list" class="stories-list" aria-label="List of saved stories">
          <!-- Stories will be loaded here -->
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._presenter.showSavedStories();
  }

  showStories(stories) {
    const bookmarkList = document.getElementById('bookmark-list');
    
    if (stories.length === 0) {
      bookmarkList.innerHTML = `
        <div class="empty-message">
          <p>No saved stories yet.</p>
        </div>
      `;
      return;
    }

    bookmarkList.innerHTML = stories.map(story => `
      <article class="story-item" data-id="${story.id}">
        <img src="${story.photoUrl}" alt="${story.description}" class="story-image" loading="lazy">
        <div class="story-content">
          <h3>${story.name || 'Guest'}</h3>
          <time datetime="${story.createdAt}">${showFormattedDate(story.createdAt)}</time>
          <p>${story.description}</p>
          ${story.lat && story.lon ? `
            <div class="story-location">
              <small>Location: ${story.lat}, ${story.lon}</small>
              <div id="map-${story.id}" class="story-map" style="height: 200px;"></div>
            </div>
          ` : ''}
          <button class="btn btn-danger delete-btn" style="margin-top: 10px" aria-label="Delete story" data-id="${story.id}">Delete</button>
        </div>
      </article>
    `).join('');

    // Add event listeners
    this._setupDeleteButtons();
    this._initMaps(stories);
  }

  _setupDeleteButtons() {
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await this._presenter.deleteStory(id);
      });
    });
  }

  _initMaps(stories) {
    stories.forEach(story => {
      if (story.lat && story.lon) {
        this._initMap(story.id, story.lat, story.lon);
      }
    });
  }

  _initMap(storyId, lat, lon) {
    try {
      const mapElement = document.getElementById(`map-${storyId}`);
      if (!mapElement) return;

      const map = L.map(mapElement).setView([lat, lon], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`Location: ${lat}, ${lon}`)
        .openPopup();
    } catch (error) {
      console.error(`Failed to init map for story ${storyId}:`, error);
      const mapElement = document.getElementById(`map-${storyId}`);
      if (mapElement) {
        mapElement.innerHTML = '<p>Failed to load map</p>';
      }
    }
  }

  removeStory(id) {
    const storyElement = document.querySelector(`.story-item[data-id="${id}"]`);
    if (storyElement) {
      storyElement.remove();
      
      // Show empty message if no stories left
      const bookmarkList = document.getElementById('bookmark-list');
      if (bookmarkList.children.length === 0) {
        bookmarkList.innerHTML = `
          <div class="empty-message">
            <p>No saved stories yet.</p>
          </div>
        `;
      }
    }
  }

  showError(message) {
    const bookmarkList = document.getElementById('bookmark-list');
    bookmarkList.innerHTML = `
      <div class="error-message">
        ${message}
      </div>
    `;
  }
}