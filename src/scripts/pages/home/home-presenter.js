import DicodingStoryAPI from "../../data/dicoding-story-api";
import { getAccessToken } from "../../utils/auth";

class HomePresenter {
  constructor({ view }) {
    this._view = view;
    this._dicodingStoryApi = DicodingStoryAPI;
  }

  async showStories() {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await this._dicodingStoryApi.getAllStories(token);

      if (!response.ok) {
        throw new Error(response.message || "Failed to load stories");
      }

      const stories = response.data.stories || response.data.listStory || [];
      this._view.showStories(stories);

      setTimeout(() => {
        this._initializeMaps(stories);
      }, 100);
    } catch (error) {
      this._view.showError(error);
    }
  }

  _initializeMaps(stories) {
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        try {
          const mapId = `map-${story.id}`;
          const mapElement = document.getElementById(mapId);

          if (mapElement && !mapElement._map) {
            const map = L.map(mapId).setView([story.lat, story.lon], 15);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            L.marker([story.lat, story.lon])
              .addTo(map)
              .bindPopup(`Story location: ${story.lat}, ${story.lon}`)
              .openPopup();

            mapElement._map = map;
          }
        } catch (error) {
          console.error(
            `Failed to initialize map for story ${story.id}:`,
            error,
          );
          const mapElement = document.getElementById(`map-${story.id}`);
          if (mapElement) {
            mapElement.innerHTML =
              '<p class="error">Gagal memuat peta. Pastikan koneksi internet Anda stabil.</p>';
          }
        }
      }
    });
  }
}

export default HomePresenter;