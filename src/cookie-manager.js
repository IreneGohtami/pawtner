import Cookies from "js-cookie";
import moment from "moment";

export const getCookie = (key) => {
  return Cookies.get(key);
};

export const setCookie = (key, value, expires = 1) => {
  Cookies.set(key, value, { expires }); // Expiration is integer representing days
};

export const setAccessTokenCookie = (key, value) => {
  //set expire after 10 min
  Cookies.set(key, value, {
    path: "/account/breeder-profile",
    expires: moment().add(10, "minutes").toDate(),
  });
};

export const deleteCookie = (key) => {
  Cookies.remove(key);
};
