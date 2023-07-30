import Cookies from "js-cookie";

export const getCookie = (key) => {
  return Cookies.get(key);
};

export const setCookie = (key, value, expires = 1) => {
  Cookies.set(key, value, { expires }); // Expiration is integer representing days
};

export const deleteCookie = (key) => {
  Cookies.remove(key);
};
