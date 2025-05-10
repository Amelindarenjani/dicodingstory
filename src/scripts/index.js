import "../styles/styles.css";
import App from "./pages/app";
import { updateNavigation } from './utils/navigation';

document.addEventListener("DOMContentLoaded", async () => {
  
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  
  await app._renderPage();
  updateNavigation();

  // kalo error ganti lagi sama yang bawah
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content available; please refresh.');
              }
            });
          });
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }

  // Tambahkan kode untuk handle skip to content
  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-link');

  skipLink.addEventListener('click', function (event) {
    event.preventDefault();
    skipLink.blur();
    
    mainContent.setAttribute('tabindex', '-1');
    mainContent.focus();
    mainContent.scrollIntoView();
    
    // Hapus tabindex setelah fokus untuk menghindari outline yang tidak diinginkan
    setTimeout(() => {
      mainContent.removeAttribute('tabindex');
    }, 1000);
  });

  window.addEventListener("hashchange", async () => {
    await app._renderPage();
  });
});