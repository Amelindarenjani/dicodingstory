import DicodingStoryAPI from "../../data/dicoding-story-api";
import { getAccessToken } from "../../utils/auth";

class AddStoryPresenter {
  constructor({ view }) {
    this._view = view;
    this._dicodingStoryApi = DicodingStoryAPI;
  }

  async postStory({ description, photo, lat, lon }) {
    try {
      const token = getAccessToken();

      let response;
      if (token) {
        response = await this._dicodingStoryApi.addStory({
          token,
          description,
          photo,
          lat,
          lon,
        });
      } else {
        response = await this._dicodingStoryApi.addStoryGuest({
          description,
          photo,
          lat,
          lon,
        });
      }
      this._view.showSuccess();
    } catch (error) {
      this._view.showError(error);
    }
  }
}

export default AddStoryPresenter;
