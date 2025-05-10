import { isLoggedIn, logout } from "../utils/auth";
import { subscribe, unsubscribe, isCurrentPushSubscriptionAvailable } from "./notification-helper";

export function updateAuthUI() {
  const authSection = document.getElementById("auth-section");
  if (!authSection) return;

  if (isLoggedIn()) {
    authSection.innerHTML = `
      <div class="auth-buttons">
        <button id="notification-btn" class="btn-notification">
          <i class="fas fa-bell"></i>
        </button>
        <button id="logout-btn" class="btn-logout">
          Logout
        </button>
      </div>
    `;

    document.getElementById("logout-btn")?.addEventListener("click", logout);

    // Setup notification button
    const setupNotificationButton  = async () => {
      const notificationBtn = document.getElementById("notification-btn");
      if (!notificationBtn) return;

      // Update state awal
      const updateButtonState = async () => {
        const isSubscribed = await isCurrentPushSubscriptionAvailable();
        notificationBtn.innerHTML = isSubscribed 
          ? '<i class="fas fa-bell"></i>' 
          : '<i class="fas fa-bell-slash"></i>';
      };

      await updateButtonState();

      notificationBtn.addEventListener("click", async () => {
        notificationBtn.disabled = true;
        try {
          const isSubscribed = await isCurrentPushSubscriptionAvailable();
          if (isSubscribed) {
            const success = await unsubscribe();
            if (success) {
              alert("Notifikasi berhasil dimatikan");
            }
          } else {
            const success = await subscribe();
            if (success) {
              alert("Notifikasi berhasil diaktifkan");
            }
          }

          // Update state setelah operasi
          await updateButtonState();
    
        } catch (error){
          console.error("Error:", error);
          alert(`Error: ${error.message}`);
        } finally {
           notificationBtn.disabled = false;
        }
      });
    };
    setupNotificationButton();
  } else {
    authSection.innerHTML = `
      <div class="auth-buttons">
        <a href="#/login" class="btn-login">Login</a>
        <a href="#/register" class="btn-register">Register</a>
      </div>
    `;
  }
}