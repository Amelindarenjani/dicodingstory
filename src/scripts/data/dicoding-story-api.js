import CONFIG from "../../scripts/config";

class DicodingStoryAPI {
  static async register({ name, email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const responseJson = await response.json();
    return {
      ok: response.ok,
      message: responseJson.message,
      data: responseJson,
    };
  }

  static async login({ email, password }) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();

      return {
        ok: response.ok,
        message: responseJson.message,
        data: responseJson,
      };
    } catch (error) {
      return {
        ok: false,
        message: "Network error: " + error.message,
        data: null,
      };
    }
  }

  static async getAllStories(
    token,
    { page = 1, size = 10, location = 0 } = {},
  ) {
    const response = await fetch(
      `${CONFIG.BASE_URL}/stories?page=${page}&size=${size}&location=${location}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const responseJson = await response.json();

    return {
      ok: response.ok,
      message: responseJson.message,
      data: {
        stories: responseJson.listStory || responseJson.stories || [],
      },
    };
  }

  static async getStoryDetail(id, token) {
    const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }

  static async addStory({ token, description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    formData.append("lat", lat.toString());
    formData.append("lon", lon.toString());

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  }

  static async addStoryGuest({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat) formData.append("lat", lat);
    if (lon) formData.append("lon", lon);

    const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  }

  static async subscribePushNotification(token, subscription) {
    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });
    const responseJson = await response.json();
    return {
      ok: response.ok,
      error: !response.ok, // Tambahkan ini
      message: responseJson.message,
      data: responseJson.data || responseJson,
    };
  }

  static async unsubscribePushNotification(token, endpoint) {
    // Validasi endpoint
    if (!endpoint || typeof endpoint !== 'string') {
      return {
        ok: false,
        error: true,
        message: '"endpoint" must be a valid uri'
      };
    }

    try{
      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: String(endpoint) }),
      });
      const responseJson = await response.json();
      return {
        ok: response.ok,
        error: !response.ok,
        message: responseJson.message,
        data: responseJson,
      };
    } catch (error){
      return {
        ok: false,
        error: true,
        message: error.message,
      };
    }
  }
}

export default DicodingStoryAPI;