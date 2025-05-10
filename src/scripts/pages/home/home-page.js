import HomePresenter from "./home-presenter";
import { showFormattedDate } from "../../utils";
import { getAccessToken } from "../../utils/auth";
import Database from "../../data/database";
import DicodingStoryAPI from "../../data/dicoding-story-api";

export default class HomePage {
  constructor() {
    this._presenter = new HomePresenter({
      view: this,
    });
  }

  async render() {
    return `
       <main class="container" aria-labelledby="stories-heading">
        <h1 id="stories-heading">Dicoding Stories</h1>
        <section id="stories-list" class="stories-list" aria-label="Daftar cerita">
          <!-- Stories will be inserted here -->
        </section>
      </main>
    `;
  }

  async afterRender() {
    await this._presenter.showStories();

    // Add event listeners to save buttons
    document.querySelectorAll('.btn-save').forEach(async (button) => {
      const storyId = button.dataset.id;
    
      // Cek apakah story sudah disimpan
      try {
        const savedStory = await Database.getStoryById(storyId);
        if (savedStory) {
          this._updateSaveButton(button, true);
          // button.textContent = 'Saved';
          // button.disabled = true;
          // button.style.backgroundColor = '#6c757d';
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
  
      button.addEventListener('click', async (e) => {
        const button = e.target;
        const storyId = button.dataset.id;
        const isSaved = button.textContent === 'Saved';
        
        if (isSaved) {
          await this._deleteSavedStory(storyId, button);
        } else {
          await this._saveStory(storyId, button);
        }
      })
    });

    document.querySelectorAll(".story-map").forEach((mapElement) => {
      try {
        const locationElement = mapElement.previousElementSibling;
        if (!locationElement || !locationElement.textContent) {
          return;
        }
        const locationText = locationElement.textContent;
        const [lat, lon] = locationText
          .replace("Lokasi: ", "")
          .split(", ")
          .map(Number);

        if (isNaN(lat) || isNaN(lon)) {
          console.warn("Invalid coordinates for map:", mapElement.id);
          return;
        }

        if (typeof L === "undefined") {
          console.error("Leaflet library not loaded!");
          return;
        }
        const map = L.map(mapElement.id).setView([lat, lon], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`Story location: ${lat}, ${lon}`)
          .openPopup();
      } catch (error) {
        console.error(
          `Failed to initialize map for element ${mapElement.id}:`,
          error,
        );
        mapElement.innerHTML = '<p class="error">Gagal memuat peta</p>';
      }
    });
  }

  async _saveStory(storyId, button) {
    try {
      const token = getAccessToken();
      if (!token) {
        alert('Please login to save stories');
        window.location.hash = '#/login';
        return;
      }
      const response = await DicodingStoryAPI.getStoryDetail(storyId, token);
      
      if (response.error) {
        throw new Error(response.message);
      }

       // Pastikan response memiliki data story yang valid
      if (!response.story) {
        throw new Error('Invalid story data');
      }
  
      await Database.saveStory(response.story);
      this._updateSaveButton(button, true);
      alert('Story saved successfully!');
    } catch (error) {
      console.error('Failed to save story:', error);
      alert(`Failed to save story: ${error.message}`);
    }
  }

  showStories(stories) {
    const storiesList = document.querySelector("#stories-list");
    storiesList.innerHTML = stories
      .map((story) => this._createStoryItem(story))
      .join("");
  }

  showError(error) {
    console.error("Failed to load stories:", error);
    document.querySelector("#stories-list").innerHTML = `
      <div class="error-message">
        Failed to load stories. Please try again later.
      </div>
    `;
  }

  _createStoryItem(story) {
    const mapId = `map-${story.id}`;
    const hasLocation = story.lat && story.lon;

    return `
      <article class="story-item">
        <img src="${story.photoUrl}" alt="${story.description}" class="story-image">
        <div class="story-content">
          <h3>${story.name || "Guest"}</h3>
          <time datetime="${story.createdAt}">${showFormattedDate(story.createdAt)}</time>
          <p>${story.description}</p>
          <div class="story-actions">
            <button class="btn btn-save" data-id="${story.id}">Save Story</button>
          </div>
          ${
            hasLocation
              ? `
            <div class="story-location">
            <div>
              <small>Location: ${story.lat}, ${story.lon}</small>
              <div id="${mapId}" class="story-map" style="height: 200px; width: 100%;"></div>
          `
              : ""
          }
        </div>
      </article>
    `;
  };

  // Method baru untuk update tampilan tombol
  _updateSaveButton(button, isSaved) {
    button.textContent = isSaved ? 'Saved' : 'Save Story';
    button.style.backgroundColor = isSaved ? '#6c757d' : '#28a745';
    // Tambahkan class untuk styling
    if (isSaved) {
      button.classList.add('saved');
      button.classList.remove('btn-save');
    } else {
      button.classList.add('btn-save');
      button.classList.remove('saved');
    }
  }

  // Method untuk menghapus story yang tersimpan
  async _deleteSavedStory(storyId, button) {
    try {
      await Database.deleteStory(storyId);
      this._updateSaveButton(button, false);
      alert('Story removed from saved!');
    } catch (error) {
      console.error('Failed to delete saved story:', error);
      alert(`Failed to delete saved story: ${error.message}`);
    }
  }
};