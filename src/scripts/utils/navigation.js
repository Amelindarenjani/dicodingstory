// src/scripts/utils/navigation.js
export function updateNavigation() {
    const navList = document.getElementById('nav-list');
    if (!navList) return;
  
    // Pastikan item navigasi untuk bookmarks ada
    const bookmarkNavItem = Array.from(navList.children).find(
      li => li.querySelector('a[href="#/bookmarks"]')
    );
  
    if (!bookmarkNavItem) {
      const li = document.createElement('li');
      li.innerHTML = '<a href="#/bookmarks">Saved Stories</a>';
      navList.insertBefore(li, document.getElementById('auth-section'));
    }
}