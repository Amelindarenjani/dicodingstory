// src/scripts/pages/bookmark/bookmark-presenter.js
import Database from "../../data/database";

export default class BookmarkPresenter {
  constructor({ view }) {
    this._view = view;
    this._database = Database;
  }

  async showSavedStories() {
    try {
      const stories = await this._database.getAllStories();
      this._view.showStories(stories);
    } catch (error) {
      console.error('Error loading saved stories:', error);
      this._view.showError('Failed to load saved stories');
    }
  }

  async deleteStory(id) {
    try {
      await this._database.deleteStory(id);
      this._view.removeStory(id);
    } catch (error) {
      console.error('Error deleting story:', error);
      this._view.showError('Failed to delete story');
    }
  }
}