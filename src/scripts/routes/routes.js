import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import AddStoryPage from "../pages/add-story/add-story-page";
import RegisterPage from "../auth/register/register-page";
import LoginPage from "../auth/login/login-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";

const routes = {
  "/": new HomePage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/about": new AboutPage(),
  "/stories/add": new AddStoryPage(),
  "/bookmarks": new BookmarkPage(),
};

export default routes;
