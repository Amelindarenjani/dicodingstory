import { openDB } from 'idb';

const CONFIG = {
  DATABASE_NAME: 'dicoding-story-db',
  DATABASE_VERSION: 1,
  OBJECT_STORE_NAME: 'saved-stories'
};

const dbPromise = openDB(CONFIG.DATABASE_NAME, CONFIG.DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(CONFIG.OBJECT_STORE_NAME)){
      database.createObjectStore(CONFIG.OBJECT_STORE_NAME, {
        keyPath: 'id'
      });
    }
  }
});

const Database = {
  async saveStory(story) {
    if (!story?.id) {
      throw new Error('Story ID is required');
    }
    return (await dbPromise).put(CONFIG.OBJECT_STORE_NAME, story);
  },

  async getAllStories() {
    try {
      const stories = await (await dbPromise).getAll(CONFIG.OBJECT_STORE_NAME);
      return (await dbPromise).getAll(CONFIG.OBJECT_STORE_NAME);
    } catch (error){
      console.error('Error getting all stories:', error);
      return [];
    }
  },

  async getStoryById(id) {
    if (!id) {
      throw new Error('ID is required');
    }
    return (await dbPromise).get(CONFIG.OBJECT_STORE_NAME, id);
  },

  async deleteStory(id) {
    if (!id) {
      throw new Error('ID is required');
    }
    return (await dbPromise).delete(CONFIG.OBJECT_STORE_NAME, id);
  }
};

export default Database;

// import { openDB } from 'idb';
 
// const DATABASE_NAME = 'dicodingstory';
// const DATABASE_VERSION = 1;
// const OBJECT_STORE_NAME = 'saved-reports';
 
// const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
//   upgrade: (database) => {
//     database.createObjectStore(OBJECT_STORE_NAME, {
//       keyPath: 'id',
//     });
//   },
// });