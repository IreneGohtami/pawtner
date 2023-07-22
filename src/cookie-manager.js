import Cookies from "js-cookie";

// Function to check if the cookie exists
export const isCookieSet = () => {
  return Cookies.get("visited") === "true";
};

// Function to set the cookie
export const setCookie = () => {
  Cookies.set("visited", "true", { expires: 365 }); // Set cookie to expire after 365 days
};
