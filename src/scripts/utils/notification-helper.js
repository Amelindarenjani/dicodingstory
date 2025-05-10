import { convertBase64ToUint8Array } from "./index";
import CONFIG from "../config";
import DicodingStoryAPI from "../data/dicoding-story-api";
import { getAccessToken } from "./auth";

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    alert("Izin notifikasi ditolak.");
    return false;
  }

  if (status === "default") {
    alert("Izin notifikasi ditutup atau diabaikan.");
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.WEB_PUSH_VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  let pushSubscription;
    try {
        if (!(await requestNotificationPermission())) {
          throw new Error("Izin notifikasi tidak diberikan");
        }

        if (await isCurrentPushSubscriptionAvailable()) {
          return true; // sudah subscribed
        }
        console.log("Mulai berlangganan push notification...");

        const registration = await navigator.serviceWorker.ready;
        pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
    
        const { endpoint, keys } = pushSubscription.toJSON();
        const token = getAccessToken();
        
        if (!token) {
          throw new Error("User not authenticated");
        }

        const response = await DicodingStoryAPI.subscribePushNotification(token, { 
          endpoint, 
          keys 
        });
        console.log("Response dari server:", response);

        // Perbaikan utama: Cek struktur response yang benar
        if (response.error === false || response.ok) {
            console.log("Berhasil subscribe push notification");
            return true;
        } else {
            // Jika format response tidak sesuai
            console.warn("Format response tidak sesuai:", response);
            throw new Error(response.message || "Gagal menyimpan subscription");
        }
        } catch (error) {
        console.error("Error dalam proses subscribe:", error);

        // Rollback subscription jika ada
        if (pushSubscription) {
            try {
            await pushSubscription.unsubscribe();
            console.log("Rollback subscription dilakukan");
            } catch (unsubError) {
            console.error("Gagal melakukan rollback:", unsubError);
            }
        }
        throw error;
    }
}

export async function unsubscribe() {
  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) return false;

    // Unsubscribe dari browser
    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      throw new Error("Gagal unsubscribe dari browser");
    }

    console.log("Berhasil unsubscribe dari browser");
    return true;
  } catch (error) {
    console.error("Error unsubscribe:", error);
    throw error;
  }
}

// export async function unsubscribe() {
//   try {
//     const pushSubscription = await getPushSubscription();

//     if (!pushSubscription) {
//       alert("Anda belum berlangganan push notification");
//       return false;
//     }

//     const subscriptionData = pushSubscription.toJSON();
//     const token = getAccessToken();
    
//     if (!token) {
//       throw new Error("User not authenticated");
//     }

//     // Pastikan endpoint valid dan di-encode
//     const endpoint = encodeURI(subscriptionData.endpoint);
//     if (!endpoint || typeof endpoint !== 'string') {
//       throw new Error("Endpoint tidak valid");
//     }

//     // pastikan endpoint dikirim sbg string
//     const response = await DicodingStoryAPI.unsubscribePushNotification(token, { endpoint });

//     if (!response.ok) {
//       throw new Error(response.message || "Gagal unsubscribe");
//     }

//     const unsubscribed = await pushSubscription.unsubscribe();

//     if (!unsubscribed) {
//       throw new Error("Gagal unsubscribe dari browser");
//     }

//     console.log("Berhasil unsubscribe");
//     return true;
//   } catch (error) {
//     console.error("unsubscribe error:", error);
//     throw error;
//   }
// }