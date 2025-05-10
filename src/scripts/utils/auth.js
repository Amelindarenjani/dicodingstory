import CONFIG from "../config";
import { getActiveRoute } from "../routes/url-parser";
import { updateAuthUI } from "./auth-ui";

export function getAccessToken() {
  return localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
}

export function putAccessToken(token) {
  if (!token) {
    console.error("Token tidak valid");
    return;
  }
  localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getAccessToken();
}

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  if (["/login", "/register"].includes(url) && isLoggedIn()) {
    location.hash = "/";
    return null;
  }
  return page;
}

export function checkAuthenticatedRoute(page) {
  if (!isLoggedIn() && !["/login", "/register"].includes(getActiveRoute())) {
    location.hash = "/login";
    return null;
  }
  return page;
}

export function logout() {
  removeAccessToken();
  updateAuthUI();
  window.location.hash = "#/login";
  window.location.reload();
}
